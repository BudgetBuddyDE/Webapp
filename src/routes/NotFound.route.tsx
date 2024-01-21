import { ActionPaper } from '@/components/Base';
import { StackedIconButton } from '@/components/StackedIconButton.component';
import { useAuthContext } from '@/core/Auth';
import { withUnauthentificatedLayout } from '@/core/Auth/Layout';
import { ExitToAppRounded, HomeRounded } from '@mui/icons-material';
import { Grid, Typography, Link } from '@mui/material';

const PageNotFound = () => {
  const { session } = useAuthContext();
  return (
    <ActionPaper
      sx={{
        width: { xs: '90%', md: '40%', lg: '30%', xl: '25%' },
        maxWidth: '480px',
        mx: 'auto',
        px: 3,
        py: 2,
        textAlign: 'center',
      }}
    >
      <Typography variant="h1">Ooops!</Typography>
      <Typography variant="h2" sx={{ mt: 1.5 }}>
        Page Not Found
      </Typography>

      <Typography sx={{ my: 1 }}>
        The page you are looking for might have been removed or moved.
      </Typography>

      <Grid container spacing={1} sx={{ width: '60%', mx: 'auto', justifyContent: 'center' }}>
        {session && (
          <Grid item xs={6}>
            <StackedIconButton
              component={Link}
              href="/"
              // to="/dashboard"
              size="large"
              startIcon={<HomeRounded />}
              sx={{ width: '100%' }}
            >
              Dashboard
            </StackedIconButton>
          </Grid>
        )}
        <Grid item xs={6}>
          <StackedIconButton
            component={Link}
            href="/sign-in"
            // to="/sign-in"
            size="large"
            startIcon={<ExitToAppRounded />}
            sx={{ width: '100%' }}
          >
            Sign-in
          </StackedIconButton>
        </Grid>
      </Grid>
    </ActionPaper>
  );
};

export default withUnauthentificatedLayout(PageNotFound);
