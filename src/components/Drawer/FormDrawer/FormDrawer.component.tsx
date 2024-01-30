import { useScreenSize } from '@/hooks';
import { drawerWidth } from '@/style/theme/theme';
import {
  Box,
  Drawer,
  Typography,
  type DrawerProps,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  ButtonProps,
} from '@mui/material';
import React from 'react';
import { ActionPaper } from '../../Base';
import { CloseRounded, DoneRounded, ErrorRounded } from '@mui/icons-material';
import { type TFormDrawerState } from './FormDrawer.reducer';

export type TFormDrawerProps = {
  state?: TFormDrawerState;
  open?: boolean;
  heading?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  closeOnBackdropClick?: boolean;
};

export const FormDrawer: React.FC<React.PropsWithChildren<TFormDrawerProps>> = ({
  state,
  open,
  onClose,
  onSubmit,
  closeOnBackdropClick = false,
  heading = 'Drawer',
  children,
}) => {
  const screenSize = useScreenSize();

  const DrawerAnchor: DrawerProps['anchor'] = React.useMemo(() => {
    return screenSize === 'small' ? 'bottom' : 'right';
  }, [screenSize]);

  return (
    <Drawer
      anchor={DrawerAnchor}
      open={open}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick' && closeOnBackdropClick) {
          if (onClose) onClose();
        }
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          boxSizing: 'border-box',
          width: { xs: 'unset', md: drawerWidth * 2 },
          margin: { xs: 1, md: 0 },
          mb: { xs: 2, md: 0 },
          borderRadius: (theme) => ({ xs: `${theme.shape.borderRadius}px`, md: 0 }),
          backgroundColor: (theme) => theme.palette.background.paper,
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
            <CloseRounded />
          </IconButton>
        </ActionPaper>
      </Box>
      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', flexDirection: 'column', height: 'inherit' }}
      >
        <Box sx={{ p: 2 }}>
          {state && state.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {state.error instanceof Error ? state.error.message : state.error}
            </Alert>
          )}
          {children}
        </Box>
        <Box sx={{ mt: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
              pt: 0,
            }}
          >
            <Button onClick={onClose} sx={{ mr: 2 }}>
              Cancel
            </Button>

            <SaveButton />
          </Box>
        </Box>
      </form>
    </Drawer>
  );
};

const SaveButton: React.FC<{ state?: TFormDrawerState } & Pick<ButtonProps, 'ref'>> =
  React.forwardRef(({ state }, ref) => {
    return (
      <Button
        type="submit"
        variant="contained"
        {...(state !== undefined
          ? {
              startIcon: state.loading ? (
                <CircularProgress color="inherit" size={16} />
              ) : state.success ? (
                <DoneRounded color="inherit" fontSize="inherit" />
              ) : !state.success && state.error !== null ? (
                <ErrorRounded color="inherit" fontSize="inherit" />
              ) : null,
              disabled: state.loading,
            }
          : {})}
        ref={ref}
      >
        Save
      </Button>
    );
  });
