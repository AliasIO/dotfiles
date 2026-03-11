#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

function usage() {
  process.stdout.write(`Usage:
  node compare-captures.js --sample /tmp/sample.json [--sample ...] [--control /tmp/control.json]
`)
}

function parseArgs(argv) {
  const options = {
    control: [],
    sample: [],
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--help') {
      options.help = true
    } else if (arg === '--sample' || arg === '--control') {
      const value = argv[index + 1]

      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${arg}`)
      }

      options[arg.slice(2)].push(path.resolve(value))
      index += 1
    } else {
      options.sample.push(path.resolve(arg))
    }
  }

  return options
}

function loadCapture(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function asSet(values) {
  return new Set((values || []).filter(Boolean))
}

function intersectSets(sets) {
  if (!sets.length) {
    return new Set()
  }

  return [...sets[0]].reduce((intersection, value) => {
    if (sets.every((set) => set.has(value))) {
      intersection.add(value)
    }

    return intersection
  }, new Set())
}

function unionSets(sets) {
  return sets.reduce((union, set) => {
    set.forEach((value) => union.add(value))

    return union
  }, new Set())
}

function subtractSet(values, blocked) {
  return [...values].filter((value) => !blocked.has(value)).sort()
}

function signalSets(capture) {
  return {
    cookieNames: asSet(capture.summary?.cookieNames),
    localStorageKeys: asSet(capture.tokenMatches?.storageKeys?.local),
    metaKeys: asSet(capture.summary?.metaKeys),
    requestHostsFetch: asSet(capture.summary?.requestHostsByType?.fetch),
    requestHostsScript: asSet(capture.summary?.requestHostsByType?.script),
    requestHostsXhr: asSet(capture.summary?.requestHostsByType?.xhr),
    responseHeaders: asSet(
      (capture.tokenMatches?.responseHeaderMatches || []).map(({ header }) => header)
    ),
    scriptHosts: asSet(capture.summary?.scriptHosts),
    sessionStorageKeys: asSet(capture.tokenMatches?.storageKeys?.session),
    windowGlobals: asSet(capture.tokenMatches?.windowGlobals),
  }
}

function compareGroup(files) {
  const captures = files.map(loadCapture)
  const sets = captures.map(signalSets)

  return {
    captures: captures.map(({ input }) => input),
    common: {
      cookieNames: [...intersectSets(sets.map(({ cookieNames }) => cookieNames))].sort(),
      localStorageKeys: [
        ...intersectSets(sets.map(({ localStorageKeys }) => localStorageKeys)),
      ].sort(),
      metaKeys: [...intersectSets(sets.map(({ metaKeys }) => metaKeys))].sort(),
      requestHostsFetch: [
        ...intersectSets(sets.map(({ requestHostsFetch }) => requestHostsFetch)),
      ].sort(),
      requestHostsScript: [
        ...intersectSets(sets.map(({ requestHostsScript }) => requestHostsScript)),
      ].sort(),
      requestHostsXhr: [
        ...intersectSets(sets.map(({ requestHostsXhr }) => requestHostsXhr)),
      ].sort(),
      responseHeaders: [
        ...intersectSets(sets.map(({ responseHeaders }) => responseHeaders)),
      ].sort(),
      scriptHosts: [...intersectSets(sets.map(({ scriptHosts }) => scriptHosts))].sort(),
      sessionStorageKeys: [
        ...intersectSets(sets.map(({ sessionStorageKeys }) => sessionStorageKeys)),
      ].sort(),
      windowGlobals: [
        ...intersectSets(sets.map(({ windowGlobals }) => windowGlobals)),
      ].sort(),
    },
    union: {
      cookieNames: [...unionSets(sets.map(({ cookieNames }) => cookieNames))].sort(),
      localStorageKeys: [
        ...unionSets(sets.map(({ localStorageKeys }) => localStorageKeys)),
      ].sort(),
      metaKeys: [...unionSets(sets.map(({ metaKeys }) => metaKeys))].sort(),
      requestHostsFetch: [
        ...unionSets(sets.map(({ requestHostsFetch }) => requestHostsFetch)),
      ].sort(),
      requestHostsScript: [
        ...unionSets(sets.map(({ requestHostsScript }) => requestHostsScript)),
      ].sort(),
      requestHostsXhr: [
        ...unionSets(sets.map(({ requestHostsXhr }) => requestHostsXhr)),
      ].sort(),
      responseHeaders: [
        ...unionSets(sets.map(({ responseHeaders }) => responseHeaders)),
      ].sort(),
      scriptHosts: [...unionSets(sets.map(({ scriptHosts }) => scriptHosts))].sort(),
      sessionStorageKeys: [
        ...unionSets(sets.map(({ sessionStorageKeys }) => sessionStorageKeys)),
      ].sort(),
      windowGlobals: [
        ...unionSets(sets.map(({ windowGlobals }) => windowGlobals)),
      ].sort(),
    },
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.help || !options.sample.length) {
    usage()

    if (!options.help) {
      throw new Error('At least one sample capture is required')
    }

    return
  }

  const sample = compareGroup(options.sample)
  const control = options.control.length
    ? compareGroup(options.control)
    : {
        captures: [],
        common: {},
        union: {
          cookieNames: [],
          localStorageKeys: [],
          metaKeys: [],
          requestHostsFetch: [],
          requestHostsScript: [],
          requestHostsXhr: [],
          responseHeaders: [],
          scriptHosts: [],
          sessionStorageKeys: [],
          windowGlobals: [],
        },
      }

  const blocked = Object.keys(control.union).reduce((accumulator, key) => {
    accumulator[key] = new Set(control.union[key] || [])

    return accumulator
  }, {})

  const sampleOnly = Object.keys(sample.common).reduce((accumulator, key) => {
    accumulator[key] = subtractSet(sample.common[key], blocked[key] || new Set())

    return accumulator
  }, {})

  process.stdout.write(
    `${JSON.stringify(
      {
        control,
        sample,
        sampleOnly,
      },
      null,
      2
    )}\n`
  )
}

main()
