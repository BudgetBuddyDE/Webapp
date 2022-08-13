import { FC, PropsWithChildren } from 'react';
import { Box, IconButton, Drawer, Divider, Typography, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { drawerWidth } from '../theme/default.theme';
import { useScreenSize } from '../hooks/useScreenSize.hook';

export interface IFormDrawerProps extends PropsWithChildren {
  open: boolean;
  heading: string;
  onClose: () => void;
  onSave: () => void;
}

export const FormDrawer: FC<IFormDrawerProps> = ({ open, heading, onClose, onSave, children }) => {
  const screenSize = useScreenSize();

  return (
    <Drawer
      anchor={screenSize === 'small' ? 'bottom' : 'right'}
      open={open}
      onClose={(ev, reason) => reason === 'backdropClick' && onClose()}
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
          <Button onClick={onClose}>Close</Button>
          <Button variant="contained" onClick={onSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};
