#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  lstatSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  renameSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const manifestPath = resolve(scriptDir, '../references/dependencies.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

const options = {
  mode: null,
  canonical: null,
  workspace: null,
}

for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index]

  if (argument === '--check' || argument === '--apply') {
    if (options.mode) {
      failUsage('Choose exactly one of --check or --apply')
    }

    options.mode = argument.slice(2)
  } else if (argument === '--canonical') {
    options.canonical = process.argv[++index]

    if (!options.canonical) {
      failUsage('--canonical requires a name')
    }
  } else if (argument === '--workspace') {
    options.workspace = process.argv[++index]

    if (!options.workspace) {
      failUsage('--workspace requires a path')
    }
  } else if (argument === '--help' || argument === '-h') {
    printUsage()
    process.exit(0)
  } else {
    failUsage(`Unknown argument: ${argument}`)
  }
}

if (!options.mode) {
  failUsage('Choose --check or --apply')
}

if (options.canonical && !manifest.canonical[options.canonical]) {
  failUsage(
    `Unknown canonical repository: ${options.canonical}. Choose ${Object.keys(
      manifest.canonical
    ).join(', ')}`
  )
}

if (options.mode === 'apply' && !options.canonical) {
  failUsage('--apply requires --canonical so publication proceeds one layer at a time')
}

const workspace = normalizePath(
  options.workspace ? resolve(options.workspace) : expandHome(manifest.workspace)
)
const errors = []
const drift = []

validateManifest()

if (errors.length) {
  finish()
}

if (options.mode === 'check') {
  checkRepositories()
  checkGitmodules()
  checkConsumers()
  checkAliases()
  finish()
}

applyCanonical(options.canonical)
finish()

function printUsage() {
  process.stdout.write(`Usage:
  sync-dependencies.mjs --check [--canonical <name>] [--workspace <path>]
  sync-dependencies.mjs --apply --canonical <name> [--workspace <path>]

Canonical names: ${Object.keys(manifest.canonical).join(', ')}

--check is local and uses cached remote-tracking refs. --apply fetches only the
selected canonical branch, replaces only declared consumer checkouts, and stages
their exact parent gitlinks. It never commits, pushes, or deploys.
`)
}

function failUsage(message) {
  process.stderr.write(`error: ${message}\n\n`)
  printUsage()
  process.exit(2)
}

function expandHome(value) {
  return value.replace(/^\$HOME(?=\/|$)/, homedir())
}

function normalizePath(value) {
  const absolute = resolve(value)

  try {
    return realpathSync(absolute)
  } catch {
    return absolute
  }
}

function safeRelativePath(value, label) {
  if (
    typeof value !== 'string' ||
    !value ||
    isAbsolute(value) ||
    value.split(/[\\/]/).includes('..')
  ) {
    errors.push(`${label} must be a non-empty relative path: ${String(value)}`)
    return false
  }

  const resolved = resolve(workspace, value)
  const back = relative(workspace, resolved)

  if (back.startsWith(`..${sep}`) || back === '..' || isAbsolute(back)) {
    errors.push(`${label} escapes the workspace: ${value}`)
    return false
  }

  return true
}

function validateManifest() {
  if (!existsSync(workspace)) {
    errors.push(`Workspace does not exist: ${workspace}`)
  }

  const consumerKeys = new Set()

  for (const [name, canonical] of Object.entries(manifest.canonical)) {
    safeRelativePath(canonical.path, `canonical.${name}.path`)

    if (!canonical.remote || !canonical.branch) {
      errors.push(`canonical.${name} requires remote and branch`)
    }
  }

  for (const [name, parentPath] of Object.entries(manifest.parents)) {
    safeRelativePath(parentPath, `parents.${name}`)
  }

  for (const consumer of manifest.consumers) {
    if (!manifest.canonical[consumer.canonical]) {
      errors.push(`Consumer uses unknown canonical repository: ${consumer.canonical}`)
    }

    if (!manifest.parents[consumer.parent]) {
      errors.push(`Consumer uses unknown parent repository: ${consumer.parent}`)
    }

    safeRelativePath(consumer.path, `consumer ${consumer.parent}.path`)

    const key = `${consumer.parent}:${consumer.path}`

    if (consumerKeys.has(key)) {
      errors.push(`Duplicate consumer declaration: ${key}`)
    }

    consumerKeys.add(key)
  }

  for (const alias of manifest.aliases) {
    safeRelativePath(alias.source, 'alias.source')
    safeRelativePath(alias.consumer, 'alias.consumer')

    if (!manifest.parents[alias.parent]) {
      errors.push(`Alias uses unknown parent repository: ${alias.parent}`)
    }
  }
}

function repositoryPath(relativePath) {
  return resolve(workspace, relativePath)
}

function git(repository, args, { allowFailure = false, input = null } = {}) {
  const result = spawnSync('git', ['-C', repository, ...args], {
    encoding: 'utf8',
    input,
  })

  if (result.error) {
    if (allowFailure) {
      return { status: 1, stdout: '', stderr: result.error.message }
    }

    throw result.error
  }

  if (result.status !== 0 && !allowFailure) {
    const detail = (result.stderr || result.stdout || '').trim()
    throw new Error(
      `git -C ${repository} ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`
    )
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  }
}

function isGitRepository(path) {
  return git(path, ['rev-parse', '--git-dir'], { allowFailure: true }).status === 0
}

function checkRepositories() {
  for (const [name, canonical] of Object.entries(manifest.canonical)) {
    const path = repositoryPath(canonical.path)

    if (!isGitRepository(path)) {
      errors.push(`Canonical repository is missing or invalid: ${name} (${path})`)
    }
  }

  for (const [name, parentPath] of Object.entries(manifest.parents)) {
    const path = repositoryPath(parentPath)

    if (!isGitRepository(path)) {
      errors.push(`Parent repository is missing or invalid: ${name} (${path})`)
    }
  }
}

function readGitmodulePaths(parentPath) {
  const modulesFile = join(parentPath, '.gitmodules')

  if (!existsSync(modulesFile)) {
    return []
  }

  const result = spawnSync(
    'git',
    ['config', '-f', modulesFile, '--get-regexp', '^submodule\\..*\\.path$'],
    { encoding: 'utf8' }
  )

  if (result.status === 1) {
    return []
  }

  if (result.status !== 0) {
    errors.push(`Unable to read submodule paths from ${modulesFile}`)
    return []
  }

  const configured = result.stdout
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(line.indexOf(' ') + 1))
    .sort()

  return configured.filter((path) => {
    if (treeGitlink(parentPath, path)) {
      return true
    }

    process.stdout.write(
      `WARN   Ignoring stale .gitmodules entry without a HEAD gitlink: ${path}\n`
    )
    return false
  })
}

function checkGitmodules() {
  for (const [parentName, parentRelativePath] of Object.entries(manifest.parents)) {
    const declared = manifest.consumers
      .filter((consumer) => consumer.parent === parentName)
      .map((consumer) => consumer.path)
      .sort()
    const actual = readGitmodulePaths(repositoryPath(parentRelativePath))

    const missing = actual.filter((path) => !declared.includes(path))
    const stale = declared.filter((path) => !actual.includes(path))

    for (const path of missing) {
      errors.push(`Unmanifested submodule in ${parentName}/.gitmodules: ${path}`)
    }

    for (const path of stale) {
      errors.push(`Manifest consumer missing from ${parentName}/.gitmodules: ${path}`)
    }
  }
}

function canonicalTarget(name, { fetch = false } = {}) {
  const canonical = manifest.canonical[name]
  const path = repositoryPath(canonical.path)
  const remoteRef = `refs/remotes/${canonical.remote}/${canonical.branch}`

  if (!isGitRepository(path)) {
    errors.push(`Canonical repository is missing or invalid: ${name} (${path})`)
    return null
  }

  if (fetch) {
    process.stdout.write(
      `FETCH  ${name} ${canonical.remote}/${canonical.branch} (${path})\n`
    )

    try {
      git(path, [
        'fetch',
        '--quiet',
        canonical.remote,
        `+refs/heads/${canonical.branch}:${remoteRef}`,
      ])
    } catch (error) {
      errors.push(error.message)
      return null
    }
  }

  const result = git(path, ['rev-parse', '--verify', `${remoteRef}^{commit}`], {
    allowFailure: true,
  })

  if (result.status !== 0) {
    errors.push(`Missing cached published ref for ${name}: ${remoteRef}`)
    return null
  }

  return result.stdout.trim()
}

function treeGitlink(parent, path) {
  const result = git(parent, ['ls-tree', 'HEAD', '--', path], { allowFailure: true })
  const match = result.stdout.match(/^160000 commit ([0-9a-f]{40})\t/)
  return match ? match[1] : null
}

function indexGitlink(parent, path) {
  const result = git(parent, ['ls-files', '--stage', '--', path], {
    allowFailure: true,
  })
  const match = result.stdout.match(/^160000 ([0-9a-f]{40}) 0\t/)
  return match ? match[1] : null
}

function workingCommit(path) {
  const result = git(path, ['rev-parse', '--verify', 'HEAD^{commit}'], {
    allowFailure: true,
  })
  return result.status === 0 ? result.stdout.trim() : null
}

function selectedConsumers() {
  return manifest.consumers.filter(
    (consumer) => !options.canonical || consumer.canonical === options.canonical
  )
}

function checkConsumers() {
  const targets = new Map()

  for (const name of new Set(selectedConsumers().map((item) => item.canonical))) {
    targets.set(name, canonicalTarget(name))
  }

  for (const consumer of selectedConsumers()) {
    const target = targets.get(consumer.canonical)

    if (!target) {
      continue
    }

    const parent = repositoryPath(manifest.parents[consumer.parent])
    const checkout = join(parent, consumer.path)
    const recorded = treeGitlink(parent, consumer.path)
    const indexed = indexGitlink(parent, consumer.path)
    const working = isGitRepository(checkout) ? workingCommit(checkout) : null
    const label = `${consumer.parent}/${consumer.path}`

    process.stdout.write(
      `CHECK  ${label} target=${short(target)} head=${short(recorded)} index=${short(
        indexed
      )} worktree=${short(working)}\n`
    )

    if (recorded !== target) {
      drift.push(`${label}: HEAD gitlink ${short(recorded)} != ${short(target)}`)
    }

    if (indexed !== target) {
      drift.push(`${label}: index gitlink ${short(indexed)} != ${short(target)}`)
    }

    if (working !== target) {
      drift.push(`${label}: checkout ${short(working)} != ${short(target)}`)
    }

    if (working) {
      const nested = git(checkout, ['submodule', 'status', '--recursive'], {
        allowFailure: true,
      })

      if (nested.status !== 0) {
        errors.push(`${label}: unable to inspect recursive submodules`)
      } else {
        for (const line of nested.stdout.split('\n').filter(Boolean)) {
          if (/^[+\-U]/.test(line)) {
            drift.push(`${label}: nested submodule drift: ${line.trim()}`)
          }
        }
      }
    }
  }
}

function aliasPathInCanonical(alias) {
  const canonicalRoot = repositoryPath(manifest.canonical['apis-shared'].path)
  const source = repositoryPath(alias.source)
  const pathInRepository = relative(canonicalRoot, source)

  if (
    pathInRepository === '..' ||
    pathInRepository.startsWith(`..${sep}`) ||
    isAbsolute(pathInRepository)
  ) {
    throw new Error(`Alias source is outside apis-shared: ${alias.source}`)
  }

  return pathInRepository.split(sep).join('/')
}

function publishedAliasBytes(alias, target) {
  const canonicalRoot = repositoryPath(manifest.canonical['apis-shared'].path)
  const pathInRepository = aliasPathInCanonical(alias)
  const result = git(canonicalRoot, ['show', `${target}:${pathInRepository}`], {
    allowFailure: true,
  })

  if (result.status !== 0) {
    errors.push(`Published alias source is missing: ${pathInRepository} at ${short(target)}`)
    return null
  }

  return Buffer.from(result.stdout)
}

function checkAliases(existingTarget = null) {
  if (options.canonical && options.canonical !== 'apis-shared') {
    return
  }

  const target = existingTarget || canonicalTarget('apis-shared')

  if (!target) {
    return
  }

  for (const alias of manifest.aliases) {
    const source = repositoryPath(alias.source)
    const consumer = repositoryPath(alias.consumer)

    if (!existsSync(source) || !existsSync(consumer)) {
      errors.push(`Alias path missing: ${alias.source} -> ${alias.consumer}`)
      continue
    }

    const sourceBytes = readFileSync(source)
    const publishedBytes = publishedAliasBytes(alias, target)

    if (!publishedBytes) {
      continue
    }

    if (!sourceBytes.equals(publishedBytes)) {
      drift.push(
        `Canonical alias source differs from published ${short(target)}: ${alias.source}`
      )
    }

    const equal = sourceBytes.equals(readFileSync(consumer))
    process.stdout.write(
      `CHECK  alias ${alias.consumer} ${equal ? 'matches' : 'differs from'} ${
        alias.source
      }\n`
    )

    if (!equal) {
      drift.push(`Alias differs: ${alias.consumer} != ${alias.source}`)
    }
  }
}

function lstatOrNull(path) {
  try {
    return lstatSync(path)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

function aliasPathInParent(alias) {
  const parent = repositoryPath(manifest.parents[alias.parent])
  const consumer = repositoryPath(alias.consumer)
  const pathInParent = relative(parent, consumer)

  if (
    pathInParent === '..' ||
    pathInParent.startsWith(`..${sep}`) ||
    isAbsolute(pathInParent)
  ) {
    throw new Error(`Alias consumer is outside ${alias.parent}: ${alias.consumer}`)
  }

  return pathInParent
}

function applyAlias(alias, target) {
  const source = repositoryPath(alias.source)
  const consumer = repositoryPath(alias.consumer)
  const parent = repositoryPath(manifest.parents[alias.parent])
  const pathInParent = aliasPathInParent(alias)
  const sourceBytes = readFileSync(source)
  const publishedBytes = publishedAliasBytes(alias, target)

  if (!publishedBytes || !sourceBytes.equals(publishedBytes)) {
    errors.push(
      `Refusing alias repair because local ${alias.source} does not match published ${short(
        target
      )}`
    )
    return
  }

  const stat = lstatOrNull(consumer)
  const expectedLink = relative(dirname(consumer), source)
  let action = 'unchanged'

  if (!stat) {
    symlinkSync(expectedLink, consumer)
    action = 'created symlink'
  } else if (stat.isSymbolicLink()) {
    const currentTarget = resolve(dirname(consumer), readlinkSync(consumer))

    if (currentTarget !== source) {
      unlinkSync(consumer)
      symlinkSync(expectedLink, consumer)
      action = 'replaced symlink'
    } else if (!sourceBytes.equals(readFileSync(consumer))) {
      errors.push(`Alias symlink content differs unexpectedly: ${alias.consumer}`)
      return
    }
  } else if (!sourceBytes.equals(readFileSync(consumer))) {
    const temporary = `${consumer}.codex-sync-${process.pid}`
    writeFileSync(temporary, sourceBytes, { mode: stat.mode })
    renameSync(temporary, consumer)
    action = 'copied content'
  }

  git(parent, ['add', '--', pathInParent])

  if (!sourceBytes.equals(readFileSync(consumer))) {
    errors.push(`Alias repair failed verification: ${alias.consumer}`)
    return
  }

  process.stdout.write(`STAGED alias ${alias.consumer} (${action})\n`)
}

function parseStatusPaths(repository) {
  const result = git(
    repository,
    ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
    { allowFailure: true }
  )

  if (result.status !== 0) {
    errors.push(`Unable to inspect parent status: ${repository}`)
    return []
  }

  const records = result.stdout.split('\0').filter(Boolean)
  const paths = []

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index]
    const status = record.slice(0, 2)
    const path = record.slice(3)

    paths.push({ status, path })

    if (/[RC]/.test(status) && records[index + 1]) {
      paths.push({ status: 'source', path: records[++index] })
    }
  }

  return paths
}

function pathWithin(path, allowed) {
  return path === allowed || path.startsWith(`${allowed}/`)
}

function applyCanonical(name) {
  checkRepositories()
  checkGitmodules()

  if (errors.length) {
    return
  }

  const consumers = manifest.consumers.filter((item) => item.canonical === name)
  const aliases = name === 'apis-shared' ? manifest.aliases : []
  const target = canonicalTarget(name, { fetch: true })

  if (!target) {
    return
  }

  const byParent = new Map()

  for (const consumer of consumers) {
    const list = byParent.get(consumer.parent) || []
    list.push(consumer)
    byParent.set(consumer.parent, list)
  }

  for (const alias of aliases) {
    const source = repositoryPath(alias.source)
    const publishedBytes = publishedAliasBytes(alias, target)

    if (!existsSync(source) || !publishedBytes) {
      errors.push(`Alias source is unavailable: ${alias.source}`)
    } else if (!readFileSync(source).equals(publishedBytes)) {
      errors.push(
        `Local alias source differs from published ${short(target)}: ${alias.source}`
      )
    }
  }

  for (const parentName of new Set(aliases.map((alias) => alias.parent))) {
    const parent = repositoryPath(manifest.parents[parentName])
    const allowedPaths = aliases
      .filter((item) => item.parent === parentName)
      .map(aliasPathInParent)

    for (const entry of parseStatusPaths(parent)) {
      if (!allowedPaths.some((allowed) => pathWithin(entry.path, allowed))) {
        errors.push(
          `${parentName} has a protected change outside selected aliases: ${entry.status} ${entry.path}`
        )
      }
    }
  }

  // Preflight every parent before mutating any consumer.
  for (const [parentName, parentConsumers] of byParent) {
    const parent = repositoryPath(manifest.parents[parentName])
    const allowedPaths = parentConsumers.map((item) => item.path)

    for (const entry of parseStatusPaths(parent)) {
      if (!allowedPaths.some((allowed) => pathWithin(entry.path, allowed))) {
        errors.push(
          `${parentName} has a protected change outside selected consumers: ${entry.status} ${entry.path}`
        )
      }
    }
  }

  if (errors.length) {
    return
  }

  for (const consumer of consumers) {
    const parent = repositoryPath(manifest.parents[consumer.parent])
    const checkout = join(parent, consumer.path)
    const before = isGitRepository(checkout) ? workingCommit(checkout) : null
    const canonical = manifest.canonical[name]

    process.stdout.write(
      `APPLY  ${consumer.parent}/${consumer.path} ${short(before)} -> ${short(target)}\n`
    )

    try {
      git(parent, ['submodule', 'sync', '--', consumer.path])
      git(parent, ['submodule', 'update', '--init', '--force', '--', consumer.path])
      git(checkout, ['clean', '-fd'])
      git(checkout, [
        'fetch',
        '--quiet',
        canonical.remote,
        `+refs/heads/${canonical.branch}:refs/remotes/${canonical.remote}/${canonical.branch}`,
      ])
      git(checkout, ['cat-file', '-e', `${target}^{commit}`])
      git(checkout, ['checkout', '--detach', '--force', target])
      git(checkout, ['submodule', 'sync', '--recursive'])
      git(checkout, ['submodule', 'update', '--init', '--recursive', '--force'])
      git(parent, ['add', '--', consumer.path])
    } catch (error) {
      errors.push(error.message)
      return
    }

    const after = workingCommit(checkout)
    const indexed = indexGitlink(parent, consumer.path)

    if (after !== target || indexed !== target) {
      errors.push(
        `${consumer.parent}/${consumer.path} failed verification: worktree=${short(
          after
        )} index=${short(indexed)} target=${short(target)}`
      )
      return
    }

    process.stdout.write(
      `STAGED ${consumer.parent}/${consumer.path} index=${short(indexed)}\n`
    )
  }

  for (const alias of aliases) {
    applyAlias(alias, target)

    if (errors.length) {
      return
    }
  }

  checkAliases(target)

}

function short(value) {
  return value ? value.slice(0, 12) : 'missing'
}

function finish() {
  if (errors.length) {
    for (const error of errors) {
      process.stderr.write(`ERROR  ${error}\n`)
    }

    process.exit(2)
  }

  if (drift.length) {
    for (const item of drift) {
      process.stderr.write(`DRIFT  ${item}\n`)
    }

    process.exit(1)
  }

  if (options.mode === 'apply') {
    process.stdout.write(
      `OK     Selected consumers and aliases match the published commit, with exact parent paths staged. Review, commit, publish, then rerun --check.\n`
    )
  } else {
    process.stdout.write(`OK     Dependency manifest and selected state are synchronized.\n`)
  }
  process.exit(0)
}
