import { Box, Card, CardContent, Typography } from '@mui/material'
import type { ChartData } from 'chart.js'
import { Bar } from 'react-chartjs-2'

type Props = { data: ChartData<'bar'> }

const chartSx = { height: { xs: 220, md: 180 }, maxHeight: 800 }

export default function OrderCountChart({ data }: Props) {
  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Order Count by Segment
        </Typography>
        <Box sx={chartSx}>
          <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
        </Box>
      </CardContent>
    </Card>
  )
}
