import { Card } from '@/components/Base';
import { ContentGrid } from '@/components/Layout';
import { withAuthLayout } from '@/core/Auth/Layout';
import { useFetchCategories } from '@/core/Category';
import { Box, Grid } from '@mui/material';

export const Categories = () => {
  const { categories, loading: loadingCategories } = useFetchCategories();

  return (
    <ContentGrid title={'Categories'}>
      <Grid item xs={12} md={6} lg={4} order={{ xs: 1, md: 2 }}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Categories</Card.Title>
              <Card.Subtitle>Manage your categories</Card.Subtitle>
            </Box>
          </Card.Header>
          <Card.Body>
            <ul>{!loadingCategories && categories.map((t) => <li key={t.id}>{t.name}</li>)}</ul>
          </Card.Body>
        </Card>
      </Grid>
    </ContentGrid>
  );
};

export default withAuthLayout(Categories);
