import {GitHub, Google} from '@mui/icons-material';
import {Button, type ButtonProps} from '@mui/material';
import React from 'react';

import {AppConfig, type TAppConfig} from '@/app.config.ts';
import {useSnackbarContext} from '@/components/Snackbar';
import {AuthService} from '@/services';

const IconMapping: Partial<Record<keyof TAppConfig['authProvider'], React.ReactNode>> = {
  github: <GitHub />,
  google: <Google />,
};

export type TSocialSignInHandlerProps = NonNullable<Awaited<ReturnType<typeof AuthService.signInWithSocial>>[0]>;

export type TSocialSignInBtnProps = {
  provider: keyof TAppConfig['authProvider'];
  onAuthProviderResponse: (data: TSocialSignInHandlerProps) => void;
} & Omit<ButtonProps, 'onClick'>;

export const SocialSignInBtn: React.FC<TSocialSignInBtnProps> = ({
  provider,
  onAuthProviderResponse,
  ...buttonProps
}) => {
  const {showSnackbar} = useSnackbarContext();
  return (
    <Button
      variant={'contained'}
      size={'large'}
      startIcon={IconMapping[provider]}
      onClick={async () => {
        const [result, err] = await AuthService.signInWithSocial(provider);
        if (err) {
          console.error(err);
          showSnackbar({message: err.message ?? 'Authentication failed'});
          return;
        }

        if (result) onAuthProviderResponse(result);

        throw new Error('Invalid response from auth provider');
      }}
      fullWidth
      {...buttonProps}>
      {AppConfig.authProvider[provider]}
    </Button>
  );
};
