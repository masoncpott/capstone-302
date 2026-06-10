import { Stack } from '@mui/material'
import { formatCurrency } from '../utils'
import KpiCard from './KpiCard'

type TopLine = {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  commercialShare: number
}

type Props = { topLine: TopLine }

export default function KpiCards({ topLine }: Props) {
  const cards = [
    {
      key: 'totalRevenue',
      label: 'Total Revenue',
      value: topLine.totalRevenue,
      formatValue: formatCurrency,
    },
    {
      key: 'totalOrders',
      label: 'Total Orders',
      value: topLine.totalOrders,
    },
    {
      key: 'avgOrderValue',
      label: 'Average Order Value',
      value: topLine.avgOrderValue,
      formatValue: formatCurrency,
    },
    {
      key: 'commercialShare',
      label: 'Commercial Revenue Share',
      value: topLine.commercialShare,
      formatValue: (value: number) => `${value.toFixed(1)}%`,
    },
  ]

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      {cards.map((card) => (
        <KpiCard
          key={card.key}
          label={card.label}
          value={card.value}
          formatValue={card.formatValue}
          cardSx={{ flex: 1 }}
        />
      ))}
    </Stack>
  )
}
