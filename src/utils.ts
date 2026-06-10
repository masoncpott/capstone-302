export const formatLabel = (value: string) =>
  value
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')

export const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: '2-digit',
})

export const toMonthKey = (dateString: string) => dateString.slice(0, 7)
export const parseMonth = (monthKey: string) => new Date(`${monthKey}-01T00:00:00`)

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
