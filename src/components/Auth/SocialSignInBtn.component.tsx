import React from 'react';
import {Google, GitHub} from '@mui/icons-material';
import {Button, type ButtonProps} from '@mui/material';
import {RecordAuthResponse, RecordModel} from 'pocketbase';
import {pb} from '@/pocketbase.ts';
import {type TAppConfig, AppConfig} from '@/app.config.ts';
import {PocketBaseCollection} from '@budgetbuddyde/types';

const IconMapping: Record<keyof TAppConfig['authProvider'], React.ReactNode> = {
  github: <GitHub />,
  google: <Google />,
};

export type TSocialSignInBtnProps = {
  provider: keyof TAppConfig['authProvider'];
  onAuthProviderResponse: (data: RecordAuthResponse<RecordModel>) => void;
} & Omit<ButtonProps, 'onClick'>;

export const SocialSignInBtn: React.FC<TSocialSignInBtnProps> = ({
  provider,
  onAuthProviderResponse,
  ...buttonProps
}) => {
  return (
    <Button
      variant={'contained'}
      size={'large'}
      startIcon={IconMapping[provider]}
      onClick={async () => {
        onAuthProviderResponse(await pb.collection(PocketBaseCollection.USERS).authWithOAuth2({provider}));
      }}
      fullWidth
      {...buttonProps}>
      {AppConfig.authProvider[provider]}
    </Button>
  );
};
