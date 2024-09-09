import {LockRounded, RefreshRounded} from '@mui/icons-material';
import {Button, Card as MuiCard, CardContent as MuiCardContent, Stack, Typography} from '@mui/material';

import {AppConfig} from '@/app.config';
import {DashboardViewIconMapping} from '@/routes/Dashboard';

import {Icon} from '../Icon.component';

export type TFeatureNotEnabledProps = {};

export const FeatureNotEnabled: React.FC<TFeatureNotEnabledProps> = ({}) => {
  return (
    <MuiCard variant="outlined" sx={{width: {xs: '90%', md: '40%', lg: '35%'}, maxWidth: '480px', margin: 'auto'}}>
      <MuiCardContent>
        <Icon icon={<LockRounded fontSize="large" />} sx={{width: '58px', mx: 'auto'}} />
        <Typography variant="h2" sx={{mt: 1.5}}>
          Feature disabled
        </Typography>
        <Typography sx={{my: 1}}>Sorry, this feature is currently not available.</Typography>

        <Stack flexDirection={'row'} gap={AppConfig.baseSpacing}>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            href="/dashboard"
            startIcon={DashboardViewIconMapping['overview']}>
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<RefreshRounded />}
            onClick={() => window.location.reload()}
            sx={{ml: 2}}>
            Refresh
          </Button>
        </Stack>
      </MuiCardContent>
    </MuiCard>
  );
};
