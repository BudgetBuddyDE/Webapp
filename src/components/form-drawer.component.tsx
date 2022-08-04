import { FC, PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import { drawerWidth } from '../theme/default.theme';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
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
