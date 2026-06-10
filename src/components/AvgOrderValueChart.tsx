import { Box, Card, CardContent, Typography } from '@mui/material'
import type { ChartData } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { formatCurrency } from '../utils'

type Props = { data: ChartData<'bar'> }

const chartSx = { height: { xs: 220, md: 180 }, maxHeight: 800 }

export default function AvgOrderValueChart({ data }: Props) {
  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Average Order Value by Segment
        </Typography>
        <Box sx={chartSx}>
          <Bar
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (ctx) =>
                      `${ctx.dataset.label}: ${formatCurrency(Number(ctx.parsed.y))}`,
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
