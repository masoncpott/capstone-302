import { Box, Card, CardContent, Typography } from '@mui/material'
import type { ChartData } from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { MetricMode } from '../types'
import { formatCurrency } from '../utils'

type Props = {
  data: ChartData<'line'>
  metricMode: MetricMode
}

const chartSx = { height: { xs: 260, md: 220 }, maxHeight: 800 }

export default function PrimaryLineChart({ data, metricMode }: Props) {
  const title =
    metricMode === 'revenue'
      ? 'Revenue'
      : metricMode === 'orderCount'
        ? 'Order Count'
        : 'Average Order Value'

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title} over Time
        </Typography>
        <Box sx={chartSx}>
          <Line
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const label = `${ctx.dataset.label}: `
                      return metricMode === 'revenue' || metricMode === 'avgOrderValue'
                        ? label + formatCurrency(Number(ctx.parsed.y))
                        : label + Number(ctx.parsed.y).toLocaleString()
                    },
                  },
                },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  )
}
