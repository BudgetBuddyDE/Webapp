import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { supabase } from '../supabase';

export const Dashboard = () => {
  return (
    <Grid container spacing={3}>
      <Typography variant="h1">Dashboard</Typography>
      <Button onClick={async () => await supabase.auth.signOut()}>Sign out</Button>
    </Grid>
  );
};
