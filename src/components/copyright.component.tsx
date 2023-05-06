import { Box, Link, Typography } from '@mui/material';
import { AppConfig } from '../app.config';

export const Copyright = (props: any) => {
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="body2" color="text.secondary" align="center" {...props}>
        {'Copyright © '}
        <Link color="inherit" href={AppConfig.website}>
          {AppConfig.appName}
        </Link>{' '}
        {new Date().getFullYear()}
      </Typography>
    </Box>
  );
};
