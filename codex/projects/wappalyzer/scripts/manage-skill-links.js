#!/usr/bin/env node

'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')

const manifestPath = path.resolve(__dirname, '..', 'skill-links.json')

function usage(message) {
  if (message) {
    process.stderr.write(`Error: ${message}\n`)
  }

  process.stderr.write('Usage: manage-skill-links.js (--check | --apply)\n')
  process.exit(2)
}

const arguments_ = process.argv.slice(2)

if (arguments_.length !== 1 || !['--check', '--apply'].includes(arguments_[0])) {
  usage('Choose exactly one mode')
}

const mode = arguments_[0].slice(2)
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

if (manifest.version !== 1) {
  usage('Manifest version must be 1')
}

const canonicalRoot = expandHome(manifest.canonicalRoot)
const discoveryRoot = expandHome(manifest.discoveryRoot)
const errors = []
const drift = []

requireDirectory(canonicalRoot, 'canonical root')
requireDirectory(discoveryRoot, 'discovery root')

const activeNames = validateNames(manifest.skills, 'skills')
const obsoleteNames = validateNames(manifest.obsolete, 'obsolete')

for (const name of activeNames) {
  if (obsoleteNames.has(name)) {
    errors.push(`Skill cannot be active and obsolete: ${name}`)
  }
}

const active = [...activeNames].map((name) => {
  const target = path.join(canonicalRoot, name)
  const destination = path.join(discoveryRoot, name)

  requireDirectory(target, `canonical skill ${name}`)

  if (!fs.existsSync(path.join(target, 'SKILL.md'))) {
    errors.push(`Canonical skill lacks SKILL.md: ${target}`)
  }

  return { destination, name, state: linkState(destination, target), target }
})

const obsolete = [...obsoleteNames].map((name) => ({
  destination: path.join(discoveryRoot, name),
  name,
}))

for (const item of obsolete) {
  const stat = lstat(item.destination)

  if (stat && !stat.isSymbolicLink()) {
    errors.push(`Refusing obsolete non-symlink discovery entry: ${item.destination}`)
  }
}

if (errors.length) {
  finish(2)
}

if (mode === 'check') {
  for (const item of active) {
    if (item.state === 'correct') {
      process.stdout.write(`[ok] ${item.destination} -> ${item.target}\n`)
    } else {
      drift.push(`${item.destination} is ${item.state}; expected ${item.target}`)
    }
  }

  for (const item of obsolete) {
    if (lstat(item.destination)) {
      drift.push(`Obsolete discovery entry remains: ${item.destination}`)
    }
  }

  finish(drift.length ? 1 : 0)
}

// Create every replacement before removing any obsolete name.
for (const item of active) {
  if (item.state === 'correct') {
    process.stdout.write(`[link:ok] ${item.destination} -> ${item.target}\n`)
    continue
  }

  if (item.state === 'non-symlink') {
    errors.push(`Refusing to replace non-symlink discovery entry: ${item.destination}`)
    continue
  }

  const temporary = `${item.destination}.codex-link-${process.pid}`

  try {
    fs.symlinkSync(item.target, temporary, 'dir')
    fs.renameSync(temporary, item.destination)
    process.stdout.write(`[link:set] ${item.destination} -> ${item.target}\n`)
  } finally {
    if (lstat(temporary)) {
      fs.unlinkSync(temporary)
    }
  }
}

if (errors.length) {
  finish(2)
}

for (const item of obsolete) {
  const stat = lstat(item.destination)

  if (!stat) {
    continue
  }

  const resolved = path.resolve(
    path.dirname(item.destination),
    fs.readlinkSync(item.destination)
  )
  const relation = path.relative(canonicalRoot, resolved)

  if (relation === '..' || relation.startsWith(`..${path.sep}`) || path.isAbsolute(relation)) {
    errors.push(`Refusing obsolete symlink outside canonical root: ${item.destination}`)
    continue
  }

  fs.unlinkSync(item.destination)
  process.stdout.write(`[link:remove] ${item.destination}\n`)
}

finish(errors.length ? 2 : 0)

function expandHome(value) {
  const home = process.env.HOME || os.homedir()

  if (value === '$HOME') {
    return home
  }

  if (typeof value === 'string' && value.startsWith('$HOME/')) {
    return path.resolve(home, value.slice(6))
  }

  if (typeof value !== 'string' || !path.isAbsolute(value)) {
    usage('Manifest roots must be absolute or begin with $HOME')
  }

  return path.resolve(value)
}

function validateNames(values, label) {
  if (!Array.isArray(values)) {
    errors.push(`${label} must be an array`)
    return new Set()
  }

  const names = new Set()

  for (const name of values) {
    if (typeof name !== 'string' || !/^[a-z0-9-]+$/.test(name)) {
      errors.push(`Invalid ${label} name: ${String(name)}`)
    } else if (names.has(name)) {
      errors.push(`Duplicate ${label} name: ${name}`)
    } else {
      names.add(name)
    }
  }

  return names
}

function requireDirectory(value, label) {
  try {
    if (!fs.statSync(value).isDirectory()) {
      errors.push(`${label} is not a directory: ${value}`)
    }
  } catch {
    errors.push(`${label} is missing: ${value}`)
  }
}

function lstat(value) {
  try {
    return fs.lstatSync(value)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

function linkState(destination, target) {
  const stat = lstat(destination)

  if (!stat) {
    return 'missing'
  }

  if (!stat.isSymbolicLink()) {
    return 'non-symlink'
  }

  const resolved = path.resolve(path.dirname(destination), fs.readlinkSync(destination))
  return resolved === target ? 'correct' : 'wrong symlink'
}

function finish(code) {
  for (const message of errors) {
    process.stderr.write(`ERROR: ${message}\n`)
  }

  for (const message of drift) {
    process.stderr.write(`DRIFT: ${message}\n`)
  }

  if (code === 0) {
    process.stdout.write('OK: managed Wappalyzer skill discovery links are current.\n')
  }

  process.exit(code)
}
