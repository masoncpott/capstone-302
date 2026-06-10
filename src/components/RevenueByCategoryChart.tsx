import { Box, Card, CardContent, Typography } from '@mui/material'
import type { ChartData } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

type Props = { data: ChartData<'doughnut'> }

const chartSx = { height: { xs: 220, md: 180 }, maxHeight: 800 }

export default function RevenueByCategoryChart({ data }: Props) {
  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Revenue by Tile Category
        </Typography>
        <Box sx={chartSx}>
          <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false }} />
        </Box>
      </CardContent>
    </Card>
  )
}
