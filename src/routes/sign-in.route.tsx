import { FormEvent, useContext, useState } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { AuthContext } from '../context/auth.context';
import { SnackbarContext } from '../context/snackbar.context';

export const SignIn = () => {
  const navigate = useNavigate();
  const { setSession } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { session, error } = await supabase.auth.signIn({
        email: email,
        password: password,
      });
      if (error) throw error;
      setSession(session);
      navigate('/dashboard', { replace: true });
      showSnackbar({
        message: 'Authentification successfull',
        action: <Button onClick={async () => await supabase.auth.signOut()}>Sign out</Button>,
      });
    } catch (error) {
      console.error(error);
      // @ts-ignore
      showSnackbar({ message: error.message || 'Authentification failed' });
    }
  };

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} sm={6} lg={4}>
        <Paper
          sx={{
            py: 3,
            px: 4,
          }}
        >
          <Typography textAlign="center" variant="h4" fontWeight={600}>
            Sign In
          </Typography>

          <form onSubmit={handleFormSubmit}>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                sx={{
                  mt: 3,
                }}
                variant="outlined"
                type="email"
                label="E-Mail"
                onChange={(e) => setEmail(e.target.value)}
              />

              <FormControl
                variant="outlined"
                sx={{
                  mt: 3,
                }}
              >
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                  type={showPassword ? 'text' : 'password'}
                  onChange={(e) => setPassword(e.target.value)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        onMouseDown={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                Sign in
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3 }} />

          <Button sx={{ width: '100%' }} onClick={() => navigate('/sign-up', { replace: true })}>
            Don't have an account? Sign up...
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};
