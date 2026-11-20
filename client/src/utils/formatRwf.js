export const formatRwf = (value) =>
  new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('RWF', 'RWF ')
    .replace(/\s+/g, ' ')
    .trim()
