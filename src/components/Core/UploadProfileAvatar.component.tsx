import { UploadFile as UploadIcon } from '@mui/icons-material';
import { Badge, Box } from '@mui/material';
import React from 'react';
import { AuthContext, SnackbarContext } from '../../context';
import { UserService } from '../../services';
import { ProfileAvatar } from './ProfileAvatar.component';
import type { ProfileAvatarProps } from './ProfileAvatar.component';

export type UploadProfileAvatarProps = ProfileAvatarProps & {};

export const UploadProfileAvatar: React.FC<UploadProfileAvatarProps> = ({ ...profileAvatarProps }) => {
    const { session } = React.useContext(AuthContext);
    const { showSnackbar } = React.useContext(SnackbarContext);
    const uploadInputRef = React.createRef<HTMLInputElement>();

    const handler = {
        onAvatarClick: function () {
            if (uploadInputRef.current) uploadInputRef.current.click();
        },
        onAvatarUpload: async function (event: React.ChangeEvent<HTMLInputElement>) {
            const files = event.target.files;
            if (!files) return;
            try {
                if (!session || !session.user) throw new Error('No user provided');
                const file = files[0];
                if (!['jpeg', 'jpg', 'png'].some((type) => file.type.includes(type)))
                    throw new Error('You can only upload png or jpg files');
                const { data, error } = await UserService.uploadAvatar(session.user, file);
                if (error) throw error;
                if (!data) throw new Error('No image got uploaded');
                const updateUser = await UserService.update({
                    data: {
                        avatar: `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/${data?.Key}`,
                    },
                });
                if (updateUser.error) throw updateUser.error;
                showSnackbar({
                    message: 'Your avatar has been uploaded. It may take a moment for the changes to be applied',
                });
            } catch (error) {
                console.error(error);
                showSnackbar({
                    message: error instanceof Error ? error.message : "Couldn't update your avatar",
                });
            }
        },
    };

    if (!session || !session.user) return <ProfileAvatar />;
    return (
        <Box sx={{ position: 'relative', '&:hover': { cursor: 'pointer' } }} onClick={handler.onAvatarClick}>
            <Badge
                sx={{
                    '& .MuiBadge-badge': {
                        p: 1,
                        py: 1.5,
                    },
                }}
                badgeContent={<UploadIcon fontSize={'small'} color="inherit" />}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                color="primary"
            >
                <ProfileAvatar {...profileAvatarProps} />
            </Badge>
            <input type="file" ref={uploadInputRef} hidden onChange={handler.onAvatarUpload} />
        </Box>
    );
};
