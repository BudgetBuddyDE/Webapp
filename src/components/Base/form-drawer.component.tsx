import { Close as CloseIcon } from '@mui/icons-material';
import { Box, Button, Drawer, IconButton, Typography } from '@mui/material';
import React from 'react';
import { useScreenSize } from '../../hooks';
import { drawerWidth } from '../../theme/default.theme';
import { ActionPaper } from './action-paper.component';

export interface IFormDrawerProps extends React.PropsWithChildren {
  open: boolean;
  heading: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  closeLabel?: string;
  saveLabel?: string;
  closeOnBackdropClick?: boolean;
}

export const FormDrawer: React.FC<IFormDrawerProps> = ({
  open,
  heading,
  onClose,
  onSubmit,
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
        <Box sx={{ p: 2 }}>{children}</Box>
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
            <Button type="submit" variant="contained">
              {saveLabel}
            </Button>
          </Box>
        </Box>
      </form>
    </Drawer>
  );
};
