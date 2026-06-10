import { Card, CardContent, Stack, Typography } from '@mui/material'
import { formatCurrency } from '../utils'

type TopLine = {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  commercialShare: number
}

type Props = { topLine: TopLine }

export default function KpiCards({ topLine }: Props) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Total Revenue
          </Typography>
          <Typography variant="h4">{formatCurrency(topLine.totalRevenue)}</Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Total Orders
          </Typography>
          <Typography variant="h4">{topLine.totalOrders}</Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Average Order Value
          </Typography>
          <Typography variant="h4">{formatCurrency(topLine.avgOrderValue)}</Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Commercial Revenue Share
          </Typography>
          <Typography variant="h4">{topLine.commercialShare.toFixed(1)}%</Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}
