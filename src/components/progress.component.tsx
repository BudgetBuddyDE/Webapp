import Box from '@mui/material/Box';
import MuiCircularProgress from '@mui/material/CircularProgress';

export const CircularProgress = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      <MuiCircularProgress />
    </Box>
  );
};
