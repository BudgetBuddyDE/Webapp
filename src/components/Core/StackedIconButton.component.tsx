import { HomeRounded as HomeRoundedIcon } from '@mui/icons-material';
import { Box, Button, type ButtonProps } from '@mui/material';

export type StackedIconButtonProps = Omit<ButtonProps, 'endIcon'>;

export const StackedIconButton: React.FC<StackedIconButtonProps> = ({
    startIcon = <HomeRoundedIcon fontSize="medium" />,
    ...buttonProps
}) => {
    return (
        <Button size="large" {...buttonProps} startIcon={undefined}>
            <Box display="flex" flexDirection="column" alignItems="center">
                {startIcon}
                {buttonProps.children}
            </Box>
        </Button>
    );
};
