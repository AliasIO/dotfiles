const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { extractSessions, selectSession } = require('./fetch-crisp-conversation')
const { unsnappy, tableRecords } = require('./leveldb-table')

function block(key, value) {
  return Buffer.concat([Buffer.from([0, key.length, value.length]), key, value, Buffer.from([0, 0, 0, 0, 1, 0, 0, 0])])
}

test('reads a compressed SSTable session that raw text scanning cannot see', () => {
  const key = Buffer.from('user_session')
  const value = Buffer.from('{"identifier":"test","key":"test"}')
  const data = block(key, value)
  // Split literal runs so neither the key nor the credential JSON is contiguous.
  const compressed = Buffer.concat([Buffer.from([data.length]), ...[...data].map(byte => Buffer.from([0, byte]))])
  const index = block(Buffer.from('z'), Buffer.from([0, compressed.length]))
  const indexOffset = compressed.length + 5
  const footer = Buffer.alloc(48)
  footer.set([0, 0, indexOffset, index.length])
  Buffer.from('57fb808b247547db', 'hex').copy(footer, 40)
  const table = Buffer.concat([compressed, Buffer.from([1, 0, 0, 0, 0]), index, Buffer.alloc(5), footer])
  assert.deepEqual(tableRecords(table), [[key, value]])
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'crisp-test-'))
  try {
    fs.writeFileSync(path.join(dir, '000001.ldb'), table)
    assert.deepEqual(extractSessions(dir), [{ identifier: 'test', key: 'test' }])
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test('decodes overlapping Snappy copies and rejects invalid distances', () => {
  assert.equal(unsnappy(Buffer.from([5, 0, 97, 1, 1])).toString(), 'aaaaa')
  assert.throws(() => unsnappy(Buffer.from([5, 0, 97, 1, 2])))
})

test('deduplicates saved records and prefers later records in a log', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'crisp-test-'))
  try {
    fs.writeFileSync(path.join(dir, '000001.log'), ['old', 'new', 'new'].map(key => `user_session{"identifier":"test","key":"${key}"}`).join('\n'))
    assert.deepEqual(extractSessions(dir).map(s => s.key), ['new', 'old'])
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test('falls back only on invalid_session, without fetching conversations first', async () => {
  const sessions = [{ identifier: 'test', key: 'old' }, { identifier: 'test', key: 'new' }]
  let calls = 0
  const result = await selectSession(sessions, 'test', async url => {
    assert.equal(url, 'https://api.crisp.chat/v1/website/test')
    if (++calls === 1) throw Object.assign(new Error('expired'), { status: 401, reason: 'invalid_session' })
    return { data: { name: 'test' } }
  })
  assert.equal(calls, 2)
  assert.equal(result.websitePayload.data.name, 'test')
  for (const status of [403, 429, 500]) {
    calls = 0
    await assert.rejects(selectSession(sessions, 'test', async () => {
      calls++
      throw Object.assign(new Error('stop'), { status })
    }), /stop/)
    assert.equal(calls, 1)
  }
  await assert.rejects(selectSession(sessions, 'test', async () => {
    throw Object.assign(new Error('expired'), { status: 401, reason: 'invalid_session' })
  }), /No valid saved/)
})
