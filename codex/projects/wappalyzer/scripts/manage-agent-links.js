#!/usr/bin/env node

'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const MANAGED_EXCLUDE_COMMENT =
  '# Managed by codex/projects/wappalyzer/scripts/manage-agent-links.js'
const DEFAULT_MANIFEST = path.resolve(__dirname, '..', 'agent-links.json')

function fail(message) {
  throw new Error(message)
}

function usage() {
  process.stderr.write(
    'Usage: manage-agent-links.js (--check | --apply) [--manifest <path>]\n'
  )
}

function parseArguments(argv) {
  let mode = null
  let manifestPath = DEFAULT_MANIFEST

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (argument === '--check' || argument === '--apply') {
      if (mode) {
        fail('Choose exactly one of --check or --apply')
      }

      mode = argument.slice(2)
      continue
    }

    if (argument === '--manifest') {
      const value = argv[index + 1]

      if (!value) {
        fail('--manifest requires a path')
      }

      manifestPath = path.resolve(value)
      index += 1
      continue
    }

    fail(`Unknown argument: ${argument}`)
  }

  if (!mode) {
    fail('Choose exactly one of --check or --apply')
  }

  return { manifestPath, mode }
}

function readManifest(manifestPath) {
  let contents

  try {
    contents = fs.readFileSync(manifestPath, 'utf8')
  } catch (error) {
    fail(`Cannot read manifest ${manifestPath}: ${error.message}`)
  }

  let manifest

  try {
    manifest = JSON.parse(contents)
  } catch (error) {
    fail(`Invalid JSON in ${manifestPath}: ${error.message}`)
  }

  if (!manifest || manifest.version !== 1) {
    fail('Manifest version must be 1')
  }

  if (!manifest.roots || typeof manifest.roots !== 'object') {
    fail('Manifest roots must be an object')
  }

  if (!Array.isArray(manifest.links) || manifest.links.length === 0) {
    fail('Manifest links must be a non-empty array')
  }

  return manifest
}

function expandHome(value, field) {
  if (typeof value !== 'string' || value.length === 0) {
    fail(`${field} must be a non-empty string`)
  }

  const home = process.env.HOME || os.homedir()

  if (!home) {
    fail('Cannot resolve $HOME')
  }

  if (value === '$HOME') {
    return path.resolve(home)
  }

  if (value.startsWith('$HOME/')) {
    return path.resolve(home, value.slice('$HOME/'.length))
  }

  if (value.includes('$HOME')) {
    fail(`${field} may use $HOME only at the beginning`)
  }

  if (!path.isAbsolute(value)) {
    fail(`${field} must be absolute or start with $HOME/`)
  }

  return path.resolve(value)
}

function resolveWithin(root, relativePath, field) {
  if (typeof relativePath !== 'string' || relativePath.length === 0) {
    fail(`${field} must be a non-empty string`)
  }

  if (path.isAbsolute(relativePath)) {
    fail(`${field} must be relative`)
  }

  const resolved = path.resolve(root, relativePath)
  const relation = path.relative(root, resolved)

  if (relation === '..' || relation.startsWith(`..${path.sep}`)) {
    fail(`${field} escapes its configured root`)
  }

  return resolved
}

function statType(filePath) {
  try {
    return fs.lstatSync(filePath)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

function runGit(repository, args) {
  const result = spawnSync('git', ['-C', repository, ...args], {
    encoding: 'utf8',
  })

  if (result.error) {
    fail(`Cannot run git for ${repository}: ${result.error.message}`)
  }

  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim()
    fail(
      `Git command failed for ${repository}: ${detail || `exit ${result.status}`}`
    )
  }

  return result.stdout.trim()
}

function getExcludePath(repository) {
  const output = runGit(repository, ['rev-parse', '--git-path', 'info/exclude'])

  if (!output) {
    fail(`Git did not return an exclude path for ${repository}`)
  }

  return path.isAbsolute(output)
    ? path.normalize(output)
    : path.resolve(repository, output)
}

function hasExcludePattern(excludePath, pattern) {
  let contents = ''

  try {
    contents = fs.readFileSync(excludePath, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }

  return contents
    .split(/\r?\n/)
    .some((line) => line.trim() === pattern)
}

function appendExcludePattern(excludePath, pattern) {
  let contents = ''

  try {
    contents = fs.readFileSync(excludePath, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }

  fs.mkdirSync(path.dirname(excludePath), { recursive: true })

  const lines = contents.split(/\r?\n/)
  const hasManagedComment = lines.includes(MANAGED_EXCLUDE_COMMENT)
  let addition = ''

  if (contents.length > 0 && !contents.endsWith('\n')) {
    addition += '\n'
  }

  if (!hasManagedComment) {
    addition += `${MANAGED_EXCLUDE_COMMENT}\n`
  }

  addition += `${pattern}\n`
  fs.appendFileSync(excludePath, addition, 'utf8')
}

function prepare(manifest) {
  const workspaceRoot = expandHome(
    manifest.roots.workspace,
    'roots.workspace'
  )
  const canonicalRoot = expandHome(
    manifest.roots.canonical,
    'roots.canonical'
  )
  const workspaceStat = statType(workspaceRoot)
  const canonicalStat = statType(canonicalRoot)

  if (!workspaceStat || !workspaceStat.isDirectory()) {
    fail(`Workspace root is not a directory: ${workspaceRoot}`)
  }

  if (!canonicalStat || !canonicalStat.isDirectory()) {
    fail(`Canonical root is not a directory: ${canonicalRoot}`)
  }

  const destinations = new Set()
  const prepared = []

  manifest.links.forEach((link, index) => {
    if (!link || typeof link !== 'object') {
      fail(`links[${index}] must be an object`)
    }

    const destination = resolveWithin(
      workspaceRoot,
      link.destination,
      `links[${index}].destination`
    )
    const source = resolveWithin(
      canonicalRoot,
      link.source,
      `links[${index}].source`
    )

    if (destinations.has(destination)) {
      fail(`Duplicate destination: ${destination}`)
    }

    destinations.add(destination)

    const sourceStat = statType(source)

    if (!sourceStat || !sourceStat.isFile()) {
      fail(`Canonical target is not a file: ${source}`)
    }

    const parentStat = statType(path.dirname(destination))

    if (!parentStat || !parentStat.isDirectory()) {
      fail(`Destination directory is missing: ${path.dirname(destination)}`)
    }

    let excludePath = null
    let excludePattern = null

    if (link.repository !== undefined || link.exclude !== undefined) {
      if (
        typeof link.repository !== 'string' ||
        typeof link.exclude !== 'string' ||
        link.exclude.length === 0 ||
        link.exclude.includes('\n') ||
        link.exclude.includes('\r')
      ) {
        fail(
          `links[${index}] must define valid repository and exclude strings together`
        )
      }

      const repository = resolveWithin(
        workspaceRoot,
        link.repository,
        `links[${index}].repository`
      )
      const repositoryRealPath = fs.realpathSync(repository)
      const repositoryTopLevel = fs.realpathSync(
        path.resolve(runGit(repository, ['rev-parse', '--show-toplevel']))
      )

      if (repositoryTopLevel !== repositoryRealPath) {
        fail(
          `Configured repository is not its Git top level: ${repository} (found ${repositoryTopLevel})`
        )
      }

      if (fs.realpathSync(path.dirname(destination)) !== repositoryRealPath) {
        fail(
          `Nested AGENTS destination must be at its repository root: ${destination}`
        )
      }

      excludePath = getExcludePath(repository)
      excludePattern = link.exclude
    }

    const destinationStat = statType(destination)
    let linkState = 'missing'
    let existingTarget = null

    if (destinationStat) {
      if (!destinationStat.isSymbolicLink()) {
        fail(`Refusing to replace non-symlink destination: ${destination}`)
      }

      existingTarget = fs.readlinkSync(destination)
      const resolvedTarget = path.resolve(path.dirname(destination), existingTarget)
      linkState = resolvedTarget === source ? 'correct' : 'wrong'
    }

    prepared.push({
      destination,
      excludePath,
      excludePattern,
      excludeState:
        excludePath && hasExcludePattern(excludePath, excludePattern)
          ? 'present'
          : excludePath
            ? 'missing'
            : null,
      existingTarget,
      linkState,
      source,
    })
  })

  return prepared
}

function reportCheck(items) {
  let clean = true

  for (const item of items) {
    if (item.linkState === 'correct') {
      process.stdout.write(`[ok] ${item.destination} -> ${item.source}\n`)
    } else if (item.linkState === 'missing') {
      clean = false
      process.stdout.write(
        `[missing] ${item.destination} -> ${item.source}\n`
      )
    } else {
      clean = false
      process.stdout.write(
        `[wrong] ${item.destination} -> ${item.existingTarget}; expected ${item.source}\n`
      )
    }

    if (item.excludeState === 'present') {
      process.stdout.write(
        `[exclude:ok] ${item.excludePath}: ${item.excludePattern}\n`
      )
    } else if (item.excludeState === 'missing') {
      clean = false
      process.stdout.write(
        `[exclude:missing] ${item.excludePath}: ${item.excludePattern}\n`
      )
    }
  }

  return clean
}

function apply(items) {
  for (const item of items) {
    if (item.linkState === 'correct') {
      process.stdout.write(`[link:ok] ${item.destination} -> ${item.source}\n`)
    } else {
      const temporaryLink = `${item.destination}.codex-link-${process.pid}`

      try {
        fs.symlinkSync(item.source, temporaryLink, 'file')
        fs.renameSync(temporaryLink, item.destination)
      } finally {
        if (statType(temporaryLink)) {
          fs.unlinkSync(temporaryLink)
        }
      }

      const action = item.linkState === 'wrong' ? 'link:replace' : 'link:create'

      process.stdout.write(`[${action}] ${item.destination} -> ${item.source}\n`)
    }

    if (item.excludeState === 'present') {
      process.stdout.write(
        `[exclude:ok] ${item.excludePath}: ${item.excludePattern}\n`
      )
    } else if (item.excludeState === 'missing') {
      appendExcludePattern(item.excludePath, item.excludePattern)
      process.stdout.write(
        `[exclude:add] ${item.excludePath}: ${item.excludePattern}\n`
      )
    }
  }
}

function main() {
  let options

  try {
    options = parseArguments(process.argv.slice(2))
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`)
    usage()
    process.exitCode = 2
    return
  }

  try {
    const manifest = readManifest(options.manifestPath)
    const items = prepare(manifest)

    if (options.mode === 'check') {
      process.exitCode = reportCheck(items) ? 0 : 1
      return
    }

    apply(items)
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`)
    process.exitCode = 2
  }
}

main()
