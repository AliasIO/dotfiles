#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import process from 'node:process'

const usage = `Usage:
  fetch_issues.mjs --repo owner/repo [--issue N] [--search QUERY] [--label NAME ...] [--state open|closed|all] [--limit N] [--comments] [--pretty]
  fetch_issues.mjs --url https://github.com/owner/repo/issues/N [--comments] [--pretty]
  fetch_issues.mjs --repo owner/repo --search "not detected" --dry-run

Options:
  --repo owner/repo   GitHub repository slug
  --issue N           Issue number
  --url URL           Full GitHub issue URL
  --search QUERY      Search text for issue listing
  --label NAME        Label filter, repeatable
  --state VALUE       open, closed, or all (default: open)
  --limit N           Maximum issues to return (default: 20)
  --comments          Include comments for single-issue fetches
  --pretty            Pretty-print JSON output
  --dry-run           Validate parsed inputs without making a network call
  --help              Show this help
`

function fail(message) {
  console.error(`[ERROR] ${message}`)
  process.exit(1)
}

function parseArgs(argv) {
  const options = {
    labels: [],
    state: 'open',
    limit: 20,
    comments: false,
    pretty: false,
    dryRun: false,
    repo: '',
    issue: null,
    search: '',
    url: '',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--help') {
      console.log(usage)
      process.exit(0)
    }

    if (arg === '--comments') {
      options.comments = true
      continue
    }

    if (arg === '--pretty') {
      options.pretty = true
      continue
    }

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--repo' || arg === '--issue' || arg === '--url' || arg === '--search' || arg === '--state' || arg === '--limit' || arg === '--label') {
      const value = argv[index + 1]

      if (!value || value.startsWith('--')) {
        fail(`Missing value for ${arg}`)
      }

      index += 1

      if (arg === '--repo') {
        options.repo = value
      } else if (arg === '--issue') {
        options.issue = Number.parseInt(value, 10)
      } else if (arg === '--url') {
        options.url = value
      } else if (arg === '--search') {
        options.search = value
      } else if (arg === '--state') {
        options.state = value
      } else if (arg === '--limit') {
        options.limit = Number.parseInt(value, 10)
      } else if (arg === '--label') {
        options.labels.push(value)
      }

      continue
    }

    fail(`Unknown argument: ${arg}`)
  }

  return options
}

function parseIssueUrl(rawUrl) {
  let parsed

  try {
    parsed = new URL(rawUrl)
  } catch {
    fail(`Invalid URL: ${rawUrl}`)
  }

  const match = parsed.pathname.match(/^\/([^/]+)\/([^/]+)\/issues\/(\d+)(?:\/|$)/)

  if (!match) {
    fail(`URL does not point to a GitHub issue: ${rawUrl}`)
  }

  return {
    repo: `${match[1]}/${match[2]}`,
    issue: Number.parseInt(match[3], 10),
  }
}

function validateOptions(options) {
  if (options.url) {
    const parsed = parseIssueUrl(options.url)
    options.repo = parsed.repo
    options.issue = parsed.issue
  }

  if (!options.repo) {
    fail('Pass --repo owner/repo or --url https://github.com/owner/repo/issues/N')
  }

  if (!/^[^/\s]+\/[^/\s]+$/.test(options.repo)) {
    fail(`Invalid repo slug: ${options.repo}`)
  }

  if (options.issue !== null && (!Number.isInteger(options.issue) || options.issue <= 0)) {
    fail(`Invalid issue number: ${options.issue}`)
  }

  if (!['open', 'closed', 'all'].includes(options.state)) {
    fail(`Invalid state: ${options.state}`)
  }

  if (!Number.isInteger(options.limit) || options.limit <= 0 || options.limit > 100) {
    fail(`Invalid limit: ${options.limit}`)
  }
}

function haveGhAuth() {
  const version = spawnSync('gh', ['--version'], { stdio: 'ignore' })

  if (version.status !== 0) {
    return false
  }

  const auth = spawnSync('gh', ['auth', 'status'], { stdio: 'ignore' })

  return auth.status === 0
}

function ghIssueFields(includeComments) {
  const fields = ['number', 'title', 'url', 'state', 'body', 'createdAt', 'updatedAt', 'labels', 'author']

  if (includeComments) {
    fields.push('comments')
  }

  return fields
}

function normalizeGhIssue(issue) {
  const normalized = {
    number: issue.number,
    title: issue.title,
    url: issue.url,
    state: issue.state,
    author: issue.author?.login ?? null,
    created_at: issue.createdAt ?? null,
    updated_at: issue.updatedAt ?? null,
    labels: Array.isArray(issue.labels) ? issue.labels.map((label) => label.name) : [],
    body: issue.body ?? '',
  }

  if (Array.isArray(issue.comments)) {
    normalized.comments = issue.comments.map((comment) => ({
      author: comment.author?.login ?? null,
      created_at: comment.createdAt ?? null,
      url: comment.url ?? null,
      body: comment.body ?? '',
    }))
  }

  return normalized
}

function runGh(options) {
  const fields = ghIssueFields(options.comments).join(',')
  let command

  if (options.issue !== null) {
    command = [
      'issue',
      'view',
      String(options.issue),
      '--repo',
      options.repo,
      '--json',
      fields,
    ]
  } else {
    command = [
      'issue',
      'list',
      '--repo',
      options.repo,
      '--state',
      options.state,
      '--limit',
      String(options.limit),
      '--json',
      fields,
    ]

    if (options.search) {
      command.push('--search', options.search)
    }

    for (const label of options.labels) {
      command.push('--label', label)
    }
  }

  const result = spawnSync('gh', command, { encoding: 'utf8' })

  if (result.status !== 0) {
    fail(result.stderr.trim() || 'gh issue command failed')
  }

  const parsed = JSON.parse(result.stdout)

  if (options.issue !== null) {
    return {
      source: 'gh',
      repo: options.repo,
      issue: normalizeGhIssue(parsed),
    }
  }

  return {
    source: 'gh',
    repo: options.repo,
    issue_count: parsed.length,
    issues: parsed.map(normalizeGhIssue),
  }
}

async function fetchJson(url, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'codex-github-wappalyzer-issues',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    const text = await response.text()
    fail(`GitHub API request failed (${response.status}): ${text || response.statusText}`)
  }

  return response.json()
}

function normalizeApiIssue(issue, comments) {
  const normalized = {
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    state: issue.state,
    author: issue.user?.login ?? null,
    created_at: issue.created_at ?? null,
    updated_at: issue.updated_at ?? null,
    labels: Array.isArray(issue.labels)
      ? issue.labels.map((label) => typeof label === 'string' ? label : label.name)
      : [],
    body: issue.body ?? '',
  }

  if (comments) {
    normalized.comments = comments.map((comment) => ({
      author: comment.user?.login ?? null,
      created_at: comment.created_at ?? null,
      url: comment.html_url ?? null,
      body: comment.body ?? '',
    }))
  }

  return normalized
}

async function runApi(options) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''

  if (options.issue !== null) {
    const issueUrl = `https://api.github.com/repos/${options.repo}/issues/${options.issue}`
    const issue = await fetchJson(issueUrl, token)

    let comments = []

    if (options.comments && issue.comments > 0) {
      comments = await fetchJson(`${issue.comments_url}?per_page=100`, token)
    }

    return {
      source: token ? 'api-token' : 'api-unauthenticated',
      repo: options.repo,
      issue: normalizeApiIssue(issue, comments),
    }
  }

  const queryParts = [`repo:${options.repo}`, 'is:issue']

  if (options.state !== 'all') {
    queryParts.push(`state:${options.state}`)
  }

  for (const label of options.labels) {
    queryParts.push(`label:"${label}"`)
  }

  if (options.search) {
    queryParts.push(options.search)
  }

  const query = encodeURIComponent(queryParts.join(' '))
  const searchUrl = `https://api.github.com/search/issues?q=${query}&per_page=${options.limit}`
  const result = await fetchJson(searchUrl, token)

  return {
    source: token ? 'api-token' : 'api-unauthenticated',
    repo: options.repo,
    issue_count: result.items.length,
    issues: result.items.map((issue) => normalizeApiIssue(issue)),
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  validateOptions(options)

  if (options.dryRun) {
    const output = {
      repo: options.repo,
      issue: options.issue,
      search: options.search,
      labels: options.labels,
      state: options.state,
      limit: options.limit,
      comments: options.comments,
      preferred_source: haveGhAuth() ? 'gh' : (process.env.GITHUB_TOKEN || process.env.GH_TOKEN ? 'api-token' : 'api-unauthenticated'),
    }

    console.log(JSON.stringify(output, null, options.pretty ? 2 : 0))
    return
  }

  const output = haveGhAuth()
    ? runGh(options)
    : await runApi(options)

  console.log(JSON.stringify(output, null, options.pretty ? 2 : 0))
}

await main()
