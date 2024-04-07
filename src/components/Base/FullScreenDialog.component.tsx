import React from 'react';
import {AppBar, Box, type BoxProps, Dialog, type DialogProps, IconButton, Toolbar, Typography} from '@mui/material';
import {CloseRounded} from '@mui/icons-material';
import {Transition} from '@/components/DeleteDialog.component.tsx';

export type TFullScreenDialogProps = DialogProps & {
  title: string;
  onClose: () => void;
  appBarActions?: React.ReactNode;
  boxProps?: BoxProps;
};

export const FullScreenDialog: React.FC<TFullScreenDialogProps> = ({
  title,
  onClose,
  appBarActions,
  boxProps,
  ...dialogProps
}) => {
  return (
    <Dialog fullScreen TransitionComponent={Transition} {...dialogProps}>
      <AppBar sx={{position: 'relative', border: 'none'}}>
        <Toolbar sx={{border: 'none'}}>
          <Typography sx={{flex: 1}} variant="h6" component="div">
            {title}
          </Typography>

          {appBarActions}
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseRounded />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box {...boxProps} sx={{p: 2, ...boxProps?.sx}}>
        {dialogProps.children}
      </Box>
    </Dialog>
  );
};
