import { Close as CloseIcon, Error as ErrorIcon, Done as SuccessIcon } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Drawer, IconButton, Typography } from '@mui/material';
import React from 'react';
import { useScreenSize } from '../../hooks';
import type { DrawerActionState } from '../../reducer';
import { drawerWidth } from '../../theme/default.theme';
import { ActionPaper } from './action-paper.component';

export interface IFormDrawerProps extends React.PropsWithChildren {
  open: boolean;
  heading: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  drawerActionState?: DrawerActionState;
  closeLabel?: string;
  saveLabel?: string;
  closeOnBackdropClick?: boolean;
}

export const FormDrawer: React.FC<IFormDrawerProps> = ({
  open,
  heading,
  onClose,
  onSubmit,
  drawerActionState,
  closeLabel = 'Close',
  saveLabel = 'Save',
  closeOnBackdropClick,
  children,
}) => {
  const screenSize = useScreenSize();

  return (
    <Drawer
      anchor={screenSize === 'small' ? 'bottom' : 'right'}
      open={open}
      onClose={(ev, reason) => reason === 'backdropClick' && closeOnBackdropClick && onClose()}
      PaperProps={{
        elevation: 0,
        sx: {
          boxSizing: 'border-box',
          width: { xs: 'unset', md: drawerWidth * 2 },
          margin: { xs: 1, md: 0 },
          mb: { xs: 2, md: 0 },
          borderRadius: (theme) => ({ xs: `${theme.shape.borderRadius}px`, md: 0 }),
          backgroundColor: '#001E3C',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          pb: 0,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {heading}
        </Typography>
        <ActionPaper>
          <IconButton color="primary" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </ActionPaper>
      </Box>
      <form
        onSubmit={onSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'inherit',
        }}
      >
        <Box sx={{ p: 2 }}>
          {drawerActionState && drawerActionState.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {drawerActionState.error instanceof Error ? drawerActionState.error.message : drawerActionState.error}
            </Alert>
          ) : null}
          {children}
        </Box>
        <Box
          sx={{
            mt: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
              pt: 0,
            }}
          >
            <Button onClick={onClose} sx={{ mr: 1 }}>
              {closeLabel}
            </Button>
            {drawerActionState !== undefined ? (
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  drawerActionState.loading ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : drawerActionState.success ? (
                    <SuccessIcon color="inherit" fontSize="inherit" />
                  ) : !drawerActionState.success && drawerActionState.error !== null ? (
                    <ErrorIcon color="inherit" fontSize="inherit" />
                  ) : null
                }
                disabled={drawerActionState.loading}
              >
                {saveLabel}
              </Button>
            ) : (
              <Button type="submit" variant="contained">
                {saveLabel}
              </Button>
            )}
          </Box>
        </Box>
      </form>
    </Drawer>
  );
};
