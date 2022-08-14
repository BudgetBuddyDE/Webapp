import { FC, PropsWithChildren } from 'react';
import { Drawer, Box, Typography, IconButton, Divider, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useScreenSize } from '../hooks/useScreenSize.hook';
import { drawerWidth } from '../theme/default.theme';

export interface IFormDrawerProps extends PropsWithChildren {
  open: boolean;
  heading: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  closeLabel?: string;
  saveLabel?: string;
  closeOnBackdropClick?: boolean;
}

export const FormDrawer: FC<IFormDrawerProps> = ({
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
          backgroundColor: '#001E3C',
          boxSizing: 'border-box',
          width: { xs: 'unset', md: drawerWidth * 2 },
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
        }}
      >
        <Typography fontWeight="bold">{heading}</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <form onSubmit={onSubmit}>
        <Box sx={{ p: 2 }}>{children}</Box>
        <Box
          sx={{
            mt: 'auto',
          }}
        >
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
            }}
          >
            <Button onClick={onClose}>{closeLabel}</Button>
            <Button type="submit" variant="contained">
              {saveLabel}
            </Button>
          </Box>
        </Box>
      </form>
    </Drawer>
  );
};
