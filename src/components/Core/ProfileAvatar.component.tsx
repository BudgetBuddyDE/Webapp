import { Avatar as MuiAvatar } from '@mui/material';
import type { AvatarProps as MuiAvatarProps, SxProps, Theme } from '@mui/material';
import React from 'react';
import { AuthContext } from '../../context';

export type ProfileAvatarProps = MuiAvatarProps;

export const ProfileAvatar: React.FC<ProfileAvatarProps> = (props) => {
    const { session } = React.useContext(AuthContext);

    if (!session || !session.user) return null;
    const user = session.user;
    const style: SxProps<Theme> = {
        height: 'auto',
        aspectRatio: '1/1',
    };

    if (!user.user_metadata.avatar || user.user_metadata.avatar.length < 1) {
        return (
            <MuiAvatar variant="rounded" {...props} sx={{ ...style, ...props.sx }}>
                {user.user_metadata.username.substring(0, 2).toUpperCase()}
            </MuiAvatar>
        );
    }
    return (
        <MuiAvatar
            variant="rounded"
            src={user.user_metadata.avatar}
            alt={user.user_metadata.username + ' Avatar'}
            {...props}
            sx={{ ...style, ...props.sx }}
        />
    );
};
