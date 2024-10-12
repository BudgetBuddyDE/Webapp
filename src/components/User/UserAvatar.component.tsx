import {Avatar as MuiAvatar, type AvatarProps as MuiAvatarProps} from '@mui/material';
import React from 'react';

import {useAuthContext} from '@/components/Auth';

export type TUserAvatarProps = MuiAvatarProps;

export const UserAvatar: React.FC<TUserAvatarProps> = props => {
  const {sessionUser} = useAuthContext();

  if (!sessionUser) return null;
  // if (sessionUser.avatar) {
  //   return (
  //     <MuiAvatar
  //       src={pb.getFileUrl(sessionUser, sessionUser.avatar)}
  //       {...props}
  //       variant="rounded"
  //       {...props}
  //       sx={{height: 'auto', aspectRatio: '1/1', ...props.sx}}
  //     />
  //   );
  // }
  return (
    <MuiAvatar variant="rounded" {...props} sx={{height: 'auto', aspectRatio: '1/1', ...props.sx}}>
      {(sessionUser.name ?? 'Anonymus').substring(0, 2).toUpperCase()}
    </MuiAvatar>
  );
};
