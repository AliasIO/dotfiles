// Read SSTable data blocks without opening or locking the live LevelDB database.
function varint(buffer, cursor) {
  let value = 0
  for (let shift = 0; shift < 49 && cursor.offset < buffer.length; shift += 7) {
    const byte = buffer[cursor.offset++]
    value += (byte & 127) * 2 ** shift
    if (!(byte & 128)) return value
  }
  throw new Error('Invalid LevelDB varint')
}

function unsnappy(input) {
  const cursor = { offset: 0 }
  const length = varint(input, cursor)
  if (length > 64 * 1024 * 1024) throw new Error('Oversized Snappy block')
  const output = Buffer.alloc(length)
  let written = 0
  while (cursor.offset < input.length) {
    const tag = input[cursor.offset++]
    const type = tag & 3
    let count, distance
    if (!type) {
      count = tag >> 2
      if (count < 60) count += 1
      else {
        const bytes = count - 59
        count = input.readUIntLE(cursor.offset, bytes) + 1
        cursor.offset += bytes
      }
      if (cursor.offset + count > input.length || written + count > length) throw new Error('Invalid Snappy literal')
      input.copy(output, written, cursor.offset, cursor.offset + count)
      cursor.offset += count
      written += count
    } else {
      if (type === 1) {
        count = 4 + ((tag >> 2) & 7)
        distance = ((tag & 224) << 3) | input[cursor.offset++]
      } else {
        count = 1 + (tag >> 2)
        const bytes = type === 2 ? 2 : 4
        distance = input.readUIntLE(cursor.offset, bytes)
        cursor.offset += bytes
      }
      if (!distance || distance > written || written + count > length) throw new Error('Invalid Snappy copy')
      for (let i = 0; i < count; i++) {
        output[written] = output[written - distance]
        written++
      }
    }
  }
  if (written !== length) throw new Error('Truncated Snappy block')
  return output
}

function entries(block) {
  const restarts = block.readUInt32LE(block.length - 4)
  const end = block.length - 4 - restarts * 4
  if (end < 0) throw new Error('Invalid LevelDB restart array')
  const cursor = { offset: 0 }
  const result = []
  let key = Buffer.alloc(0)
  while (cursor.offset < end) {
    const shared = varint(block, cursor)
    const nonshared = varint(block, cursor)
    const length = varint(block, cursor)
    if (shared > key.length || cursor.offset + nonshared + length > end) throw new Error('Invalid LevelDB entry')
    key = Buffer.concat([key.subarray(0, shared), block.subarray(cursor.offset, cursor.offset + nonshared)])
    cursor.offset += nonshared
    result.push([key, block.subarray(cursor.offset, cursor.offset + length)])
    cursor.offset += length
  }
  return result
}

function tableRecords(file) {
  if (file.length < 48 || file.subarray(-8).toString('hex') !== '57fb808b247547db') throw new Error('Invalid LevelDB table')
  function readBlock(handle) {
    const cursor = { offset: 0 }
    const offset = varint(handle, cursor)
    const size = varint(handle, cursor)
    if (offset + size + 5 > file.length) throw new Error('Invalid LevelDB block')
    const data = file.subarray(offset, offset + size)
    const compression = file[offset + size]
    if (compression === 0) return data
    if (compression === 1) return unsnappy(data)
    throw new Error('Unsupported LevelDB compression')
  }
  const footer = file.subarray(-48)
  const cursor = { offset: 0 }
  varint(footer, cursor)
  varint(footer, cursor)
  return entries(readBlock(footer.subarray(cursor.offset))).flatMap(([, handle]) => entries(readBlock(handle)))
}

module.exports = { tableRecords, unsnappy, entries }
