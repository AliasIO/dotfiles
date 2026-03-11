#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

function usage() {
  process.stdout.write(`Usage:
  node capture-evidence.js --repo /path/to/wappalyzer --url https://example.com [options]

Options:
  --technology "Name"        Technology name used to build search tokens
  --website https://vendor   Vendor website used to build host tokens
  --output /tmp/file.json    Write JSON output to a file
  --probe basic|full         Default: basic
  --delay 500                Default: 500
  --observe 3000             Observe after load before taking the final page snapshot
  --max-wait 8000            Default: 8000
  --pretty                   Pretty-print JSON
  --include-html             Include full HTML in the output
  --include-scripts          Include inline and external script bodies in the output
  --help                     Show this text
`)
}

function parseArgs(argv) {
  const options = {
    delay: 500,
    includeHtml: false,
    includeScripts: false,
    maxWait: 8000,
    observe: 3000,
    pretty: false,
    probe: 'basic',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--help') {
      options.help = true
    } else if (arg === '--pretty') {
      options.pretty = true
    } else if (arg === '--include-html') {
      options.includeHtml = true
    } else if (arg === '--include-scripts') {
      options.includeScripts = true
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const value = argv[index + 1]

      if (value === undefined || value.startsWith('--')) {
        throw new Error(`Missing value for --${key}`)
      }

      options[key.replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = value
      index += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (options.defer !== undefined) {
    options.observe = options.defer
    delete options.defer
  }

  return options
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '')
}

function normalizeHost(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

function getHost(value) {
  try {
    return normalizeHost(new URL(value).hostname)
  } catch {
    return normalizeHost(value)
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function buildTokens(technology, website) {
  const genericHostLabels = new Set(['www', 'com', 'net', 'org', 'io', 'ai', 'app', 'co'])
  const tokens = new Set()
  const shortTokens = new Set()
  const name = String(technology || '').trim()

  if (name) {
    const collapsed = normalize(name)

    if (collapsed) {
      if (collapsed.length <= 3) {
        shortTokens.add(collapsed)
      } else {
        tokens.add(collapsed)
      }
    }

    name
      .split(/[^a-z0-9]+/i)
      .map((part) => normalize(part))
      .filter(Boolean)
      .forEach((part) => {
        if (part.length <= 3) {
          shortTokens.add(part)
        } else {
          tokens.add(part)
        }
      })
  }

  const host = getHost(website)

  if (host) {
    host
      .split('.')
      .filter((part) => !genericHostLabels.has(part))
      .map((part) => normalize(part))
      .filter(Boolean)
      .forEach((part) => {
        if (part.length <= 3) {
          shortTokens.add(part)
        } else {
          tokens.add(part)
        }
      })
  }

  return {
    tokens: [...tokens],
    shortTokens: [...shortTokens],
  }
}

function truncate(value, maxLength = 240) {
  const string = String(value || '')

  if (string.length <= maxLength) {
    return string
  }

  return `${string.slice(0, maxLength)}...`
}

function hostFromUrl(value) {
  try {
    return new URL(value).hostname.toLowerCase()
  } catch {
    return ''
  }
}

function stringifyHeaders(headers) {
  if (!headers || headers.constructor !== Object) {
    return {}
  }

  return Object.keys(headers).reduce((result, key) => {
    result[key] = headers[key]

    return result
  }, {})
}

function requestToJson(request) {
  let postData = ''
  let frameUrl = ''

  try {
    postData = request.postData() || ''
  } catch {
    postData = ''
  }

  try {
    frameUrl = request.frame() ? request.frame().url() : ''
  } catch {
    frameUrl = ''
  }

  return {
    frameUrl,
    headers: stringifyHeaders(request.headers()),
    host: hostFromUrl(request.url()),
    isNavigationRequest: request.isNavigationRequest(),
    method: request.method(),
    postData: postData ? truncate(postData, 1000) : '',
    resourceType: request.resourceType(),
    url: request.url(),
  }
}

function responseToJson(response) {
  let security = {}

  try {
    const details = response.securityDetails()

    if (details) {
      security = {
        issuer: details.issuer(),
        protocol: details.protocol(),
        subjectName: details.subjectName(),
      }
    }
  } catch {
    security = {}
  }

  return {
    fromCache: response.fromCache(),
    fromServiceWorker: response.fromServiceWorker(),
    headers: stringifyHeaders(response.headers()),
    host: hostFromUrl(response.url()),
    ok: response.ok(),
    resourceType: response.request().resourceType(),
    security,
    status: response.status(),
    url: response.url(),
  }
}

function buildSummary(result) {
  const page = result.page || {}
  const requests = result.network.requests || []
  const responses = result.network.responses || []
  const requestHostsByType = requests.reduce((accumulator, request) => {
    accumulator[request.resourceType] = accumulator[request.resourceType] || []
    accumulator[request.resourceType].push(request.host)

    return accumulator
  }, {})
  const responseHostsByType = responses.reduce((accumulator, response) => {
    accumulator[response.resourceType] = accumulator[response.resourceType] || []
    accumulator[response.resourceType].push(response.host)

    return accumulator
  }, {})

  Object.keys(requestHostsByType).forEach((key) => {
    requestHostsByType[key] = unique(requestHostsByType[key]).sort()
  })
  Object.keys(responseHostsByType).forEach((key) => {
    responseHostsByType[key] = unique(responseHostsByType[key]).sort()
  })

  return {
    cookieNames: Object.keys(page.cookies || {}).sort(),
    detectedTechnologies: (result.results?.technologies || [])
      .map(({ name }) => name)
      .sort(),
    scriptBodyCount: page.scriptBodyCount || 0,
    metaKeys: Object.keys(page.meta || {}).sort(),
    requestCount: requests.length,
    requestHostsByType,
    responseCount: responses.length,
    responseHostsByType,
    scriptHosts: unique((page.scriptSrc || []).map(hostFromUrl)).sort(),
    scriptSrcCount: (page.scriptSrc || []).length,
  }
}

function findTextMatches(text, terms, label, limit = 8) {
  if (!text) {
    return []
  }

  const haystack = String(text)
  const lower = haystack.toLowerCase()
  const results = []

  for (const term of terms) {
    const index = lower.indexOf(term.toLowerCase())

    if (index === -1) {
      continue
    }

    const start = Math.max(0, index - 80)
    const end = Math.min(haystack.length, index + term.length + 80)

    results.push({
      label,
      match: term,
      snippet: haystack.slice(start, end).replace(/\s+/g, ' ').trim(),
    })

    if (results.length >= limit) {
      break
    }
  }

  return results
}

function matchesToken(value, tokenTerms, hostTerms) {
  const normalized = normalize(value)
  const lower = String(value || '').toLowerCase()

  return (
    tokenTerms.some((term) => normalized.includes(term) || term.includes(normalized)) ||
    hostTerms.some((term) => lower.includes(term))
  )
}

function tokenMatches(result, tokenTerms, shortTerms, hostTerms) {
  const page = result.page || {}
  const terms = [...tokenTerms, ...shortTerms]
  const matches = {
    cookieMatches: [],
    htmlSnippets: [],
    metaMatches: [],
    requestUrlMatches: [],
    responseHeaderMatches: [],
    scriptSnippets: [],
    scriptUrlMatches: [],
    storageKeys: page.storageKeys || { local: [], session: [] },
    windowGlobals: page.windowGlobals || [],
  }

  for (const [name, value] of Object.entries(page.cookies || {})) {
    if (matchesToken(name, terms, hostTerms) || matchesToken(value, terms, hostTerms)) {
      matches.cookieMatches.push({
        name,
        value: truncate(value, 120),
      })
    }
  }

  for (const [key, values] of Object.entries(page.meta || {})) {
    const entries = Array.isArray(values) ? values : [values]

    entries.forEach((value) => {
      if (matchesToken(key, terms, hostTerms) || matchesToken(value, terms, hostTerms)) {
        matches.metaMatches.push({
          content: truncate(value, 200),
          key,
        })
      }
    })
  }

  matches.scriptUrlMatches = (page.scriptSrc || [])
    .filter((url) => matchesToken(url, terms, hostTerms))
    .slice(0, 20)
    .map((url) => ({
      host: hostFromUrl(url),
      url,
    }))

  matches.requestUrlMatches = (result.network.requests || [])
    .filter(({ url }) => matchesToken(url, terms, hostTerms))
    .slice(0, 30)
    .map(({ host, resourceType, url }) => ({
      host,
      resourceType,
      url,
    }))

  matches.responseHeaderMatches = (result.network.responses || [])
    .flatMap(({ headers, url }) =>
      Object.entries(headers || {}).flatMap(([key, value]) => {
        const values = Array.isArray(value) ? value : [value]

        return values
          .filter(
            (entry) =>
              matchesToken(key, terms, hostTerms) ||
              matchesToken(entry, terms, hostTerms)
          )
          .map((entry) => ({
            header: key,
            url,
            value: truncate(entry, 200),
          }))
      })
    )
    .slice(0, 30)

  matches.htmlSnippets = findTextMatches(page.html || '', [...terms, ...hostTerms], 'html')
  matches.scriptSnippets = (page.scripts || [])
    .flatMap((script, index) =>
      findTextMatches(script, [...terms, ...hostTerms], `script[${index}]`, 2)
    )
    .slice(0, 12)

  return matches
}

async function collectPageSignals(page, tokens, shortTokens, hostTerms) {
  return page.evaluate(
    ({ tokens, shortTokens, hostTerms }) => {
      const normalize = (value) =>
        String(value || '')
          .normalize('NFKD')
          .replace(/[\u0300-\u036F]/g, '')
          .toLowerCase()
          .replace(/&/g, ' and ')
          .replace(/[^a-z0-9]+/g, '')

      const matches = (value) => {
        const normalized = normalize(value)
        const lower = String(value || '').toLowerCase()

        return (
          [...tokens, ...shortTokens].some(
            (term) =>
              normalized.includes(term) || (normalized && term.includes(normalized))
          ) || hostTerms.some((term) => lower.includes(term))
        )
      }

      const selectorFor = (node) => {
        const tag = node.tagName ? node.tagName.toLowerCase() : 'node'
        const id = node.id ? `#${node.id}` : ''
        const classes = node.classList ? [...node.classList].slice(0, 2).join('.') : ''

        return `${tag}${id}${classes ? `.${classes}` : ''}`
      }

      const windowGlobals = Object.getOwnPropertyNames(window)
        .filter((name) => matches(name))
        .slice(0, 50)

      const storageKeys = {
        local: Object.keys(localStorage).filter((key) => matches(key)).slice(0, 50),
        session: Object.keys(sessionStorage)
          .filter((key) => matches(key))
          .slice(0, 50),
      }

      const domMatches = []

      for (const node of Array.from(document.querySelectorAll('*'))) {
        const attributes = {}

        for (const attribute of Array.from(node.attributes || [])) {
          if (matches(attribute.name) || matches(attribute.value)) {
            attributes[attribute.name] = attribute.value
          }
        }

        if (!Object.keys(attributes).length) {
          continue
        }

        domMatches.push({
          attributes,
          selector: selectorFor(node),
          text: String(node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        })

        if (domMatches.length >= 30) {
          break
        }
      }

      return {
        domMatches,
        storageKeys,
        windowGlobals,
      }
    },
    { hostTerms, shortTokens, tokens }
  )
}

async function collectBrowserSnapshot(page, tokens, shortTokens, hostTerms) {
  const cookies = (
    await page.cookies().catch(() => [])
  ).reduce((result, { name, value }) => {
    result[name] = value

    return result
  }, {})

  const pageData = await page.evaluate(
    ({ tokens, shortTokens, hostTerms }) => {
      const normalize = (value) =>
        String(value || '')
          .normalize('NFKD')
          .replace(/[\u0300-\u036F]/g, '')
          .toLowerCase()
          .replace(/&/g, ' and ')
          .replace(/[^a-z0-9]+/g, '')

      const matches = (value) => {
        const normalized = normalize(value)
        const lower = String(value || '').toLowerCase()

        return (
          [...tokens, ...shortTokens].some(
            (term) =>
              normalized.includes(term) || (normalized && term.includes(normalized))
          ) || hostTerms.some((term) => lower.includes(term))
        )
      }

      const selectorFor = (node) => {
        const tag = node.tagName ? node.tagName.toLowerCase() : 'node'
        const id = node.id ? `#${node.id}` : ''
        const classes = node.classList ? [...node.classList].slice(0, 2).join('.') : ''

        return `${tag}${id}${classes ? `.${classes}` : ''}`
      }

      const scriptNodes = Array.from(document.getElementsByTagName('script'))
      const windowGlobals = Object.getOwnPropertyNames(window)
        .filter((name) => matches(name))
        .slice(0, 50)
      const storageKeys = {
        local: Object.keys(localStorage).filter((key) => matches(key)).slice(0, 50),
        session: Object.keys(sessionStorage)
          .filter((key) => matches(key))
          .slice(0, 50),
      }
      const domMatches = []

      for (const node of Array.from(document.querySelectorAll('*'))) {
        const attributes = {}

        for (const attribute of Array.from(node.attributes || [])) {
          if (matches(attribute.name) || matches(attribute.value)) {
            attributes[attribute.name] = attribute.value
          }
        }

        if (!Object.keys(attributes).length) {
          continue
        }

        domMatches.push({
          attributes,
          selector: selectorFor(node),
          text: String(node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        })

        if (domMatches.length >= 30) {
          break
        }
      }

      return {
        domMatches,
        html: document.documentElement.outerHTML,
        links: Array.from(document.links)
          .map(({ href }) => href)
          .filter(Boolean)
          .slice(0, 50),
        meta: Array.from(document.querySelectorAll('meta')).reduce((metas, meta) => {
          const key = meta.getAttribute('name') || meta.getAttribute('property')

          if (key) {
            metas[key.toLowerCase()] = metas[key.toLowerCase()] || []
            metas[key.toLowerCase()].push(meta.getAttribute('content'))
          }

          return metas
        }, {}),
        scriptSrc: scriptNodes
          .map(({ src }) => src)
          .filter((src) => src && !src.startsWith('data:text/javascript;')),
        scripts: scriptNodes
          .map((node) => node.textContent)
          .filter((script) => script),
        storageKeys,
        url: location.href,
        windowGlobals,
      }
    },
    { hostTerms, shortTokens, tokens }
  )

  return {
    ...pageData,
    cookies,
    scriptBodyCount: Array.isArray(pageData.scripts) ? pageData.scripts.length : 0,
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    usage()

    return
  }

  if (!options.repo || !options.url) {
    usage()
    throw new Error('--repo and --url are required')
  }

  const repoPath = path.resolve(options.repo)
  const cliPath = path.join(repoPath, 'cli', 'index.js')

  if (!fs.existsSync(cliPath)) {
    throw new Error(`CLI entry not found: ${cliPath}`)
  }

  const Wappalyzer = require(cliPath)
  const { tokens, shortTokens } = buildTokens(options.technology, options.website)
  const vendorHost = getHost(options.website)
  const hostTerms = unique(
    vendorHost
      ? [vendorHost, ...vendorHost.split('.').filter((part) => part.length > 3)]
      : []
  )

  const result = {
    input: {
      observe: parseInt(options.observe, 10) || 0,
      repo: repoPath,
      technology: options.technology || '',
      url: options.url,
      website: options.website || '',
    },
    logs: [],
    network: {
      requests: [],
      responses: [],
    },
    page: {},
    results: {},
    tokens: {
      hostTerms,
      shortTokens,
      tokens,
    },
  }

  const wappalyzer = new Wappalyzer({
    delay: parseInt(options.delay, 10) || 500,
    htmlMaxCols: 2000,
    htmlMaxRows: 2000,
    maxDepth: 0,
    maxUrls: 1,
    maxWait: parseInt(options.maxWait, 10) || 8000,
    probe: ['basic', 'full'].includes(options.probe) ? options.probe : 'basic',
    recursive: false,
  })

  let pageInstrumented = false

  try {
    await wappalyzer.init()

    const site = await wappalyzer.open(options.url)

    site.on('log', ({ message, source }) => {
      result.logs.push({
        level: 'log',
        message: String(message),
        source,
      })
    })

    site.on('error', ({ message, source }) => {
      result.logs.push({
        level: 'error',
        message: String(message),
        source,
      })
    })

    site.on('request', async ({ page, request }) => {
      if (!pageInstrumented) {
        pageInstrumented = true

        page.on('response', async (response) => {
          try {
            result.network.responses.push(responseToJson(response))
          } catch (error) {
            result.logs.push({
              level: 'error',
              message: String(error.message || error),
              source: 'capture-response',
            })
          }
        })
      }

      result.network.requests.push(requestToJson(request))
    })

    site.on('goto', async ({ cookies, html, links, meta, page, scriptSrc, scripts, url }) => {
      const genericSignals = await collectPageSignals(page, tokens, shortTokens, hostTerms)
      const observeMs = Math.max(0, parseInt(options.observe, 10) || 0)

      result.page = {
        cookies,
        domMatches: genericSignals.domMatches,
        html,
        links: (links || []).map((link) => String(link)).slice(0, 50),
        meta,
        scriptSrc,
        scriptBodyCount: Array.isArray(scripts) ? scripts.length : 0,
        scripts: Array.isArray(scripts) ? scripts : [],
        storageKeys: genericSignals.storageKeys,
        url: String(url),
        windowGlobals: genericSignals.windowGlobals,
      }

      if (observeMs) {
        await sleep(observeMs)
      }

      result.page = await collectBrowserSnapshot(
        page,
        tokens,
        shortTokens,
        hostTerms
      )
    })

    site.on('analyze', async (analysis) => {
      result.results = analysis
    })

    result.results = await site.analyze()

    if (!result.page.url) {
      throw new Error(
        'Real browser capture did not produce a live page snapshot. Do not rely on raw HTTP-only evidence.'
      )
    }

    result.summary = buildSummary(result)
    result.tokenMatches = tokenMatches(result, tokens, shortTokens, hostTerms)

    if (!options.includeHtml) {
      result.page.html = ''
    }

    if (!options.includeScripts) {
      result.page.scripts = []
    }

    const output = `${JSON.stringify(result, null, options.pretty ? 2 : null)}\n`

    if (options.output) {
      fs.writeFileSync(path.resolve(options.output), output)
    }

    process.stdout.write(output)
  } finally {
    await wappalyzer.destroy().catch(() => {})
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message || String(error)}\n`)
  process.exit(1)
})
