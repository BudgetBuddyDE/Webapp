import { AppConfig } from '@/app.config';
import { Box, Link, Typography } from '@mui/material';

export const Footer = () => {
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="body2" color="text.secondary" align="center">
        {'© '} {new Date().getFullYear()}{' '}
        <Link color="inherit" href="https://budget-buddy.de">
          {AppConfig.appName}
        </Link>{' '}
        v{AppConfig.version}
      </Typography>
    </Box>
  );
};
