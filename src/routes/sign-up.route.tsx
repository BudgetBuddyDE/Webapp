import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { User } from '@supabase/supabase-js';
import { FormEvent, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/card.component';
import { AuthContext } from '../context/auth.context';
import { SnackbarContext } from '../context/snackbar.context';
import { supabase } from '../supabase';

export const SignUp = () => {
  const navigate = useNavigate();
  const { setSession } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const [form, setForm] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const registerUser = (email: string, password: string) => {
    return supabase.auth.signUp({ email: email, password: password });
  };

  const registerProfile = (user: User, username: string) => {
    return supabase.from('profiles').insert([{ id: user.id, username: username }]);
  };

  const formHandler = {
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    formSubmit: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        const values = Object.keys(form);
        if (!values.includes('username')) throw new Error('Provide an username');
        if (!values.includes('email')) throw new Error('Provide an email');
        if (!values.includes('password')) throw new Error('Provide an password');

        const userRegistration = await registerUser(form.email, form.password);
        if (userRegistration.error || !userRegistration.user) throw userRegistration.error;
        const userProfileRegistration = await registerProfile(userRegistration.user, form.username);
        if (userProfileRegistration.error) throw userProfileRegistration.error;
        setSession(userRegistration.session);
        navigate('/dashboard', { replace: true });
        showSnackbar({
          message: 'Registration successfull',
          action: <Button onClick={async () => await supabase.auth.signOut()}>Sign out</Button>,
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        showSnackbar({ message: error.message || 'Registration failed' });
      }
    },
  };

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} sm={6} lg={4}>
        <Card
          sx={{
            py: 3,
            px: 4,
          }}
        >
          <Typography textAlign="center" variant="h4" fontWeight={600}>
            Sign Up
          </Typography>

          <form onSubmit={formHandler.formSubmit}>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                sx={{
                  mt: 3,
                }}
                variant="outlined"
                label="Username"
                name="username"
                onChange={formHandler.inputChange}
              />

              <TextField
                sx={{
                  mt: 3,
                }}
                variant="outlined"
                type="email"
                label="E-Mail"
                name="email"
                onChange={formHandler.inputChange}
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
                  name="password"
                  onChange={formHandler.inputChange}
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
                Sign up
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3 }} />

          <Button sx={{ width: '100%' }} onClick={() => navigate('/sign-in', { replace: true })}>
            Already registered? Sign in...
          </Button>
        </Card>
      </Grid>
    </Grid>
  );
};
