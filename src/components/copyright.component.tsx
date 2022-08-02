import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

export const Copyright = (props: any) => {
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="body2" color="text.secondary" align="center" {...props}>
        {'Copyright © '}
        <Link color="inherit" href="https://budget-buddy.de">
          Budget-Buddy
        </Link>{' '}
        {new Date().getFullYear()}
      </Typography>
    </Box>
  );
};
