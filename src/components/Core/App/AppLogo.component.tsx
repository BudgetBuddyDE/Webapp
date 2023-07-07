import React from 'react';
import { Image } from '@/components/Base/Image.component';
import type { SxProps, Theme } from '@mui/material';

export type AppLogoProps = {
    sx?: SxProps<Theme>;
};

export const AppLogo: React.FC<AppLogoProps> = ({ sx }) => {
    return (
        <Image
            src="/logo.png"
            alt="BudgetBuddy Logo"
            sx={{
                width: '6rem',
                height: 'auto',
                aspectRatio: '1/1',
                ...sx,
            }}
        />
    );
};
