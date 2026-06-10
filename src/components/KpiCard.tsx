import { Card, CardContent, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

type Props = {
  label: string
  value: number
  formatValue?: (value: number) => string
  cardSx?: SxProps<Theme>
}

export default function KpiCard({ label, value, formatValue, cardSx }: Props) {
  return (
    <Card sx={cardSx}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4">{formatValue ? formatValue(value) : value}</Typography>
      </CardContent>
    </Card>
  )
}