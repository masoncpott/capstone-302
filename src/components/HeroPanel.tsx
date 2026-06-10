import { Box, Chip, Container, Stack, Typography } from '@mui/material'

export default function HeroPanel() {
  return (
    <Box className="heroPanel" sx={{ py: 7, mb: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={2.5}>
          <Chip
            label="Tile Sales Narrative Prototype"
            sx={{ width: 'fit-content', bgcolor: 'rgba(255,255,255,0.7)' }}
          />
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Commercial projects drive fewer orders but much higher revenue.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 860 }}>
            Residential demand creates steady weekly activity while large commercial project orders
            create outsized revenue swings.
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
