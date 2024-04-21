import {useScreenSize} from '@/hooks';
import {drawerWidth} from '@/style/theme/theme';
import {Box, Drawer, Typography, type DrawerProps, Button, IconButton, Alert, CircularProgress} from '@mui/material';
import React from 'react';
import {ActionPaper} from '@/components/Base';
import {CloseRounded, DoneRounded, ErrorRounded} from '@mui/icons-material';
import {type TFormDrawerState} from '@/components/Drawer';
import {useKeyPress} from '@/hooks/useKeyPress.hook.ts';

/**
 * @deprecated
 */
export type TFormDrawerProps = {
  state?: TFormDrawerState;
  open?: boolean;
  heading?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  closeOnBackdropClick?: boolean;
};

/**
 * @deprecated
 */
export const FormDrawer: React.FC<React.PropsWithChildren<TFormDrawerProps>> = ({
  state,
  open,
  onClose,
  onSubmit,
  closeOnBackdropClick = false,
  heading = 'Drawer',
  children,
}) => {
  const drawerRef = React.useRef<HTMLDivElement | null>(null);
  const saveBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const screenSize = useScreenSize();

  useKeyPress(
    ['s'],
    e => {
      if (saveBtnRef.current) {
        e.preventDefault();
        saveBtnRef.current.click();
      }
    },
    drawerRef.current,
    true,
  );

  const DrawerAnchor: DrawerProps['anchor'] = React.useMemo(() => {
    return screenSize === 'small' ? 'bottom' : 'right';
  }, [screenSize]);

  return (
    <Drawer
      ref={drawerRef}
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
          width: {xs: 'unset', md: drawerWidth * 2},
          margin: {xs: 1, md: 0},
          mb: {xs: 2, md: 0},
          borderRadius: theme => ({xs: `${theme.shape.borderRadius}px`, md: 0}),
          backgroundColor: theme => theme.palette.background.paper,
        },
      }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          pb: 0,
        }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {heading}
        </Typography>
        <ActionPaper>
          <IconButton color="primary" onClick={onClose}>
            <CloseRounded />
          </IconButton>
        </ActionPaper>
      </Box>
      <form onSubmit={onSubmit} style={{display: 'flex', flexDirection: 'column', height: 'inherit'}}>
        <Box sx={{p: 2}}>
          {state && state.error && (
            <Alert severity="error" sx={{mb: 2}}>
              {state.error instanceof Error ? state.error.message : state.error}
            </Alert>
          )}
          {children}
        </Box>
        <Box sx={{mt: 'auto'}}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
              pt: 0,
            }}>
            <Button onClick={onClose} sx={{mr: 2}} tabIndex={2}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              ref={saveBtnRef}
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
              tabIndex={1}>
              Save
            </Button>
          </Box>
        </Box>
      </form>
    </Drawer>
  );
};
