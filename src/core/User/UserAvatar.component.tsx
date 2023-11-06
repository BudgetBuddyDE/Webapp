import React from 'react';
import { Avatar as MuiAvatar, type AvatarProps as MuiAvatarProps } from '@mui/material';
import { useAuthContext } from '../Auth';

export type TUserAvatarProps = MuiAvatarProps;

export const UserAvatar: React.FC<TUserAvatarProps> = (props) => {
  const { session } = useAuthContext();
  if (!session) return null;
  return (
    <MuiAvatar
      variant="rounded"
      {...props}
      sx={{ height: 'auto', aspectRatio: '1/1', ...props.sx }}
    >
      {session.name.substring(0, 2).toUpperCase()}
    </MuiAvatar>
  );
};
