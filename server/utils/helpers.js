const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const generateOrderNumber = () => {
  const now = new Date()
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const random = Math.floor(10000 + Math.random() * 90000)
  return `SC-${stamp}-${random}`
}

const toCsv = (rows, columns) => {
  const escape = (value) => {
    if (value === null || value === undefined) return ''
    const text = String(value)
    if (/[",\n\r]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }

  const header = columns.map((column) => escape(column.label)).join(',')
  const body = rows.map((row) => columns.map((column) => escape(row[column.key])).join(','))
  return [header, ...body].join('\n')
}

module.exports = { slugify, generateOrderNumber, toCsv }
