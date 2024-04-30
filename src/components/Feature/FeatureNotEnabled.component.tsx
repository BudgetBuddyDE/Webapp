import {ActionPaper} from '@/components/Base';
import {Button, Typography} from '@mui/material';
import {Icon} from '../Icon.component';
import {LockRounded, RefreshRounded} from '@mui/icons-material';
import {DashboardViewIconMapping} from '@/routes/Dashboard';

export const FeatureNotEnabled = () => {
  return (
    <ActionPaper
      sx={{
        width: {xs: '90%', md: '40%', lg: '35%'},
        maxWidth: '480px',
        margin: 'auto',
        px: 3,
        py: 2,
        textAlign: 'center',
      }}>
      <Icon icon={<LockRounded fontSize="large" />} sx={{width: '58px', mx: 'auto'}} />
      <Typography variant="h2" sx={{mt: 1.5}}>
        Feature disabled
      </Typography>
      <Typography sx={{my: 1}}>Sorry, this feature is currently not available.</Typography>
      <Button variant="contained" color="primary" href="/dashboard" startIcon={DashboardViewIconMapping['overview']}>
        Go to Dashboard
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<RefreshRounded />}
        onClick={() => window.location.reload()}
        sx={{ml: 2}}>
        Refresh
      </Button>
    </ActionPaper>
  );
};
