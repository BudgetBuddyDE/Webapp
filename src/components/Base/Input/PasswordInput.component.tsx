import {VisibilityOffRounded, VisibilityRounded} from '@mui/icons-material';
import {
  FormControl,
  type FormControlProps,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  type InputLabelProps,
  Link,
  OutlinedInput,
  type OutlinedInputProps,
} from '@mui/material';
import React from 'react';

export type TPasswordInputProps = {
  formControlProps?: FormControlProps;
  inputLabelProps?: InputLabelProps;
  outlinedInputProps?: OutlinedInputProps;
  showForgotPassword?: boolean;
};

export const PasswordInput: React.FC<TPasswordInputProps> = ({
  formControlProps,
  inputLabelProps,
  outlinedInputProps,
  showForgotPassword = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <FormControl fullWidth {...formControlProps}>
      <FormLabel htmlFor="password" {...inputLabelProps}>
        Password
      </FormLabel>
      <OutlinedInput
        type={showPassword ? 'text' : 'password'}
        id="password"
        name="password"
        placeholder="Enter password"
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowPassword(prev => !prev)}
              sx={{border: 0, backgroundColor: 'transparent'}}
              size="small"
              edge="end">
              {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
            </IconButton>
          </InputAdornment>
        }
        {...outlinedInputProps}
      />
      {showForgotPassword && (
        <FormHelperText id="forgot-password-link" component={Link} href="/request-password-reset" sx={{ml: 'auto'}}>
          Forgot password?
        </FormHelperText>
      )}
    </FormControl>
  );
};
