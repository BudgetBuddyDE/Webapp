import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';
import type { User } from '@supabase/supabase-js';
import React from 'react';

export interface AvatarProps extends MuiAvatarProps {
  user: User;
}

export const ProfileAvatar: React.FC<AvatarProps> = (props) => {
  const metadata = props.user.user_metadata;
  if (metadata.avatar.length > 0) {
    return (
      <MuiAvatar
        variant="rounded"
        src={metadata.avatar}
        alt={metadata.username + ' Avatar'}
        {...props}
      />
    );
  } else
    return (
      <MuiAvatar variant="rounded" {...props}>
        {metadata.username.substring(0, 2).toUpperCase()}
      </MuiAvatar>
    );
};
