#!/usr/bin/env node

const fs = require('fs')
const os = require('os')
const path = require('path')

const LEVELDB_DIR = path.join(
  os.homedir(),
  'Library',
  'Application Support',
  'crisp-app-desktop',
  'Local Storage',
  'leveldb'
)

function fail(message) {
  console.error(message)
  process.exit(1)
}

function usage() {
  console.error(
    [
      'Usage:',
      "  node scripts/fetch-crisp-conversation.js '<crisp-url>' [--json] [--limit N|all] [--include-contact] [--dry-run]",
      '  node scripts/fetch-crisp-conversation.js <website_id> <session_id> [--json] [--limit N|all] [--include-contact] [--dry-run]',
    ].join('\n')
  )
  process.exit(1)
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    includeContact: false,
    json: false,
    limit: 50,
  }
  const positional = []

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--json') {
      options.json = true
      continue
    }

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--include-contact') {
      options.includeContact = true
      continue
    }

    if (arg === '--limit') {
      const value = argv[index + 1]

      if (!value) {
        fail('Missing value for --limit')
      }

      if (value === 'all') {
        options.limit = null
        index += 1
        continue
      }

      const limit = Number.parseInt(value, 10)

      if (!Number.isInteger(limit) || limit < 1) {
        fail('--limit must be a positive integer')
      }

      options.limit = limit
      index += 1
      continue
    }

    if (arg === '--help' || arg === '-h') {
      usage()
    }

    positional.push(arg)
  }

  if (positional.length !== 1 && positional.length !== 2) {
    usage()
  }

  return { options, positional }
}

function parseTarget(positional) {
  if (positional.length === 2) {
    return {
      websiteId: positional[0],
      sessionId: positional[1],
    }
  }

  const input = positional[0]
  const match = input.match(
    /https?:\/\/app\.crisp\.chat\/website\/([^/]+)\/inbox\/(session_[^/?#]+)/
  )

  if (!match) {
    fail('Could not parse a Crisp website/session pair from the provided argument')
  }

  return {
    websiteId: match[1],
    sessionId: match[2],
  }
}

function listCredentialFiles(directory) {
  let entries

  try {
    entries = fs.readdirSync(directory, { withFileTypes: true })
  } catch (error) {
    fail(`Could not read Crisp desktop storage at ${directory}`)
  }

  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        (entry.name.endsWith('.ldb') || entry.name.endsWith('.log'))
    )
    .map((entry) => path.join(directory, entry.name))
    .sort((left, right) => {
      const leftStat = fs.statSync(left)
      const rightStat = fs.statSync(right)

      return rightStat.mtimeMs - leftStat.mtimeMs
    })
}

function extractSession(directory) {
  const files = listCredentialFiles(directory)
  const pattern =
    /user_session[\s\S]{0,400}?"identifier":"([^"]+)","key":"([^"]+)"/

  for (const file of files) {
    let text

    try {
      text = fs.readFileSync(file, 'latin1')
    } catch (error) {
      continue
    }

    const match = text.match(pattern)

    if (match) {
      return {
        identifier: match[1],
        key: match[2],
      }
    }
  }

  fail('Could not find a local Crisp desktop user_session')
}

async function fetchJson(url, headers) {
  const response = await fetch(url, { headers })
  const body = await response.text()

  let payload = null

  if (body) {
    try {
      payload = JSON.parse(body)
    } catch (error) {
      payload = null
    }
  }

  if (!response.ok) {
    const reason =
      (payload && payload.reason) || body || response.statusText || 'Request failed'

    fail(`${response.status} ${reason} for ${url}`)
  }

  return payload
}

function pickMessages(messages, limit) {
  if (!limit || messages.length <= limit) {
    return messages
  }

  return messages.slice(-limit)
}

function redactContactFields(value) {
  if (Array.isArray(value)) {
    return value.map(redactContactFields)
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  return Object.entries(value).reduce((result, [key, item]) => {
    if (['email', 'phone', 'phone_number'].includes(key.toLowerCase())) {
      return result
    }

    result[key] = redactContactFields(item)
    return result
  }, {})
}

function formatTimestamp(value) {
  if (!value) {
    return 'unknown-time'
  }

  return new Date(value).toISOString()
}

function compactText(value, maxLength = 220) {
  if (value == null) {
    return ''
  }

  const text = String(value).replace(/\s+/g, ' ').trim()

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength - 3)}...`
}

function formatValue(value) {
  if (value == null) {
    return 'unknown'
  }

  if (typeof value === 'object') {
    return compactText(JSON.stringify(value))
  }

  return compactText(value)
}

function messageBody(message) {
  if (typeof message.content === 'string') {
    return compactText(message.content)
  }

  if (
    message.content &&
    typeof message.content === 'object' &&
    typeof message.content.text === 'string'
  ) {
    return compactText(message.content.text)
  }

  if (typeof message.preview === 'string' && message.preview.trim()) {
    return compactText(message.preview)
  }

  if (message.content && typeof message.content === 'object') {
    return compactText(JSON.stringify(message.content))
  }

  return ''
}

function messageAuthor(message, includeContact) {
  if (message.from === 'operator') {
    return compactText(
      (message.user &&
        (message.user.nickname || (includeContact && message.user.email))) ||
        'operator'
    )
  }

  if (message.from === 'user') {
    return compactText(
      (message.user &&
        (message.user.nickname || (includeContact && message.user.email))) ||
        'user'
    )
  }

  return compactText(message.from || 'unknown')
}

function formatSummary(target, payload, options) {
  const displayedMessages = pickMessages(payload.messages, options.limit)
  const conversation = payload.conversation
  const meta = payload.meta || {}
  const participants = Array.isArray(conversation.participants)
    ? conversation.participants.length
    : 0

  const lines = [
    `Website: ${payload.website?.name || 'unknown'} (${payload.website?.domain || 'unknown'})`,
    `Website ID: ${target.websiteId}`,
    `Session ID: ${target.sessionId}`,
    `State: ${formatValue(conversation.state)}`,
    `Status: ${formatValue(conversation.status)}`,
    `Active: ${formatValue(conversation.active)}`,
    `Unread: ${formatValue(conversation.unread)}`,
    `Participants: ${participants}`,
    `Visitor: ${compactText(meta.nickname || 'unknown')}`,
  ]

  if (options.includeContact && meta.email) {
    lines.push(`Visitor email: ${meta.email}`)
  }

  if (options.includeContact && meta.phone) {
    lines.push(`Visitor phone: ${meta.phone}`)
  }

  lines.push(
    `Messages: ${payload.messageTotal} total${options.limit ? `, showing last ${displayedMessages.length}` : ''}`
  )
  lines.push('')

  for (const message of displayedMessages) {
    lines.push(
      `[${formatTimestamp(message.timestamp)}] ${messageAuthor(message, options.includeContact)} (${message.from || 'unknown'}/${message.type || 'unknown'}): ${messageBody(message)}`
    )
  }

  return lines.join('\n')
}

async function main() {
  const { options, positional } = parseArgs(process.argv.slice(2))
  const target = parseTarget(positional)

  if (options.dryRun) {
    console.log(
      JSON.stringify(
        {
          ...target,
          includeContact: options.includeContact,
          json: options.json,
          limit: options.limit,
        },
        null,
        2
      )
    )
    return
  }

  const session = extractSession(LEVELDB_DIR)
  const authorization = `Basic ${Buffer.from(
    `${session.identifier}:${session.key}`
  ).toString('base64')}`
  const headers = {
    Accept: 'application/json',
    Authorization: authorization,
    'X-Crisp-Tier': 'user',
  }
  const base = `https://api.crisp.chat/v1/website/${target.websiteId}/conversation/${target.sessionId}`

  const [websitePayload, conversationPayload, metaPayload, messagesPayload] =
    await Promise.all([
      fetchJson(`https://api.crisp.chat/v1/website/${target.websiteId}`, headers),
      fetchJson(base, headers),
      fetchJson(`${base}/meta`, headers),
      fetchJson(`${base}/messages`, headers),
    ])

  const allMessages = (messagesPayload && messagesPayload.data) || []
  let payload = {
    website: websitePayload && websitePayload.data,
    conversation: conversationPayload && conversationPayload.data,
    meta: metaPayload && metaPayload.data,
    messageTotal: allMessages.length,
    messages: pickMessages(allMessages, options.limit),
  }

  if (!options.includeContact) {
    payload = redactContactFields(payload)
  }

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2))
    return
  }

  console.log(formatSummary(target, payload, options))
}

main().catch((error) => {
  fail(error.message || String(error))
})
