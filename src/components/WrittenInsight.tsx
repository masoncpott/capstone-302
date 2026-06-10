import { Alert, Card, CardContent, Stack, Typography } from '@mui/material'

export default function WrittenInsight() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Written Insight
        </Typography>
        <Stack spacing={1.5}>
          <Alert severity="info">
            Commercial volume is lower by count but dominates revenue due to high-value project
            orders.
          </Alert>
          <Alert severity="warning">
            Residential order activity remains more frequent across months, reinforcing baseline
            operational demand.
          </Alert>
          <Alert severity="success">
            Customer mix and project profile together explain why order count and revenue trends can
            diverge.
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  )
}
