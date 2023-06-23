import { AppConfig } from '@/app.config';
import { Box, Link, Typography } from '@mui/material';

export const Footer = () => {
    return (
        <Box sx={{ py: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center">
                {'Copyright © '}
                <Link color="inherit" href={AppConfig.website}>
                    {AppConfig.appName}
                </Link>{' '}
                {new Date().getFullYear()}
            </Typography>
        </Box>
    );
};
