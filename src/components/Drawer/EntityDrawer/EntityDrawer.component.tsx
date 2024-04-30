import React from 'react';
import {Button, CircularProgress, Drawer, DrawerProps, IconButton, Stack, Typography} from '@mui/material';
import {useScreenSize, useKeyPress} from '@/hooks';
import {ActionPaper} from '@/components/Base';
import {CloseRounded} from '@mui/icons-material';
import {drawerWidth} from '@/style/theme/theme';
import {useForm, type FieldValues, type DefaultValues, type UseFormReturn} from 'react-hook-form';

export type IEntityDrawer<T extends FieldValues> = {
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  defaultValues?: DefaultValues<T> | undefined;
  children: (props: {form: UseFormReturn<T, any, undefined>}) => React.ReactNode;
  onSubmit: (data: T) => void;
  isLoading?: boolean;
};

export const EntityDrawer = <T extends FieldValues>({
  open,
  onClose,
  title,
  subtitle,
  children,
  defaultValues,
  onSubmit,
  closeOnBackdropClick,
  closeOnEscape,
  isLoading = false,
}: IEntityDrawer<T>) => {
  const drawerRef = React.useRef<HTMLDivElement | null>(null);
  const saveBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const screenSize = useScreenSize();
  const form = useForm<T>({defaultValues: defaultValues});

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

  const drawerAnchor: DrawerProps['anchor'] = React.useMemo(
    () => (screenSize === 'small' ? 'bottom' : 'right'),
    [screenSize],
  );

  const handler = {
    handleDrawerClose(_event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'closeButton') {
      if ((reason === 'backdropClick' && !closeOnBackdropClick) || (reason === 'escapeKeyDown' && !closeOnEscape)) {
        return;
      }

      onClose();
      form.reset();
    },
    handleSubmit(data: T) {
      onSubmit(data);
    },
  };

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues]);

  return (
    <Drawer
      ref={drawerRef}
      open={open}
      anchor={drawerAnchor}
      onClose={handler.handleDrawerClose}
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
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} sx={{p: 2, pb: 0}}>
        <Stack>
          <Typography variant="subtitle1" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            {subtitle}
          </Typography>
        </Stack>
        <ActionPaper>
          <IconButton color="primary" onClick={() => handler.handleDrawerClose({}, 'closeButton')}>
            <CloseRounded />
          </IconButton>
        </ActionPaper>
      </Stack>
      <form
        onSubmit={form.handleSubmit(handler.handleSubmit)}
        style={{display: 'flex', flexDirection: 'column', flex: 1}}
        noValidate>
        {children({form})}

        <Stack direction={'row'} justifyContent={'flex-end'} sx={{mt: 'auto', p: 2, pt: 0}}>
          <Button sx={{mr: 2}} onClick={() => handler.handleDrawerClose({}, 'closeButton')}>
            Close
          </Button>
          <Button
            ref={saveBtnRef}
            type="submit"
            variant="contained"
            startIcon={isLoading ? <CircularProgress color="inherit" size={16} /> : undefined}
            tabIndex={1}>
            Save
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
};