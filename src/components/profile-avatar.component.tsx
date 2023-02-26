import { UploadFile as UploadIcon } from '@mui/icons-material';
import { Badge, Box, Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';
import type { User } from '@supabase/supabase-js';
import React from 'react';

export interface ProfileAvatarProps extends MuiAvatarProps {
  user: User;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = (props) => {
  const metadata = props.user.user_metadata;
  if (metadata.avatar.length > 0) {
    return <MuiAvatar variant="rounded" src={metadata.avatar} alt={metadata.username + ' Avatar'} {...props} />;
  } else {
    return (
      <MuiAvatar variant="rounded" {...props}>
        {metadata.username.substring(0, 2).toUpperCase()}
      </MuiAvatar>
    );
  }
};

export interface ProfileAvatarWithUploadProps extends MuiAvatarProps {
  user: User;
  onUpload: (filelist: FileList | null) => void;
}

export const ProfileAvatarWithUpload: React.FC<ProfileAvatarWithUploadProps> = (props) => {
  const metadata = props.user.user_metadata;
  const uploadInputRef = React.createRef<HTMLInputElement>();

  const handleOnClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        '&:hover': { cursor: 'pointer' },
        ...props.sx,
      }}
    >
      <Box
        sx={{
          zIndex: 20,
          position: 'absolute',
          right: '-0.5rem',
          bottom: '-0.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '1.8rem',
          height: '1.8rem',
          backgroundColor: (theme) => theme.palette.primary.main,
          borderRadius: '50%',
        }}
      >
        <UploadIcon sx={{ fontSize: '1rem', color: (theme) => theme.palette.primary.contrastText }} />
      </Box>
      {metadata.avatar.length > 0 ? (
        <MuiAvatar
          variant="rounded"
          src={metadata.avatar}
          alt={metadata.username + ' Avatar'}
          onClick={handleOnClick}
          sx={{ zIndex: 15 }}
          {...props}
        />
      ) : (
        <Badge color="secondary" overlap="circular" badgeContent="Upload">
          <MuiAvatar variant="rounded" {...props} onClick={handleOnClick}>
            {metadata.username.substring(0, 2).toUpperCase()}
          </MuiAvatar>
        </Badge>
      )}
      <input ref={uploadInputRef} type="file" hidden onChange={(event) => props.onUpload(event.target.files)} />
    </Box>
  );
};
