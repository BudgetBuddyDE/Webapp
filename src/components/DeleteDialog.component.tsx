import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  type DialogProps as MuiDialogProps,
  Slide,
} from '@mui/material';
import {type TransitionProps} from '@mui/material/transitions';
import React from 'react';

export const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export type TDeleteDialogProps = Pick<
  MuiDialogProps,
  'open' | 'onClose' | 'maxWidth' | 'TransitionComponent' | 'TransitionProps' | 'transitionDuration'
> & {
  onCancel: () => void;
  onConfirm: () => void;
  withTransition?: boolean;
};

export const DeleteDialog: React.FC<TDeleteDialogProps> = ({
  open,
  onClose,
  maxWidth = 'xs',
  onCancel,
  onConfirm,
  withTransition = false,
  ...transitionProps
}) => {
  // const screenSize = useScreenSize();
  // if (screenSize == 'small') {
  //   return (
  //     <FormDrawer
  //       heading="Attension"
  //       open={open}
  //       onClose={onCancel}
  //       onSubmit={() => onConfirm()}
  //       closeOnBackdropClick
  //     >
  //       <Typography>Are you sure you want to delete these entries?</Typography>
  //     </FormDrawer>
  //   );
  // }
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (onClose) onClose(event, reason);
      }}
      maxWidth={maxWidth}
      PaperProps={{elevation: 0}}
      {...transitionProps}
      TransitionComponent={
        withTransition
          ? !transitionProps.TransitionComponent
            ? Transition
            : transitionProps.TransitionComponent
          : undefined
      }>
      <DialogTitle variant="h2" textAlign="center">
        Attention
      </DialogTitle>
      <DialogContent>
        <DialogContentText variant="inherit" textAlign="center">
          Are you sure you want to delete these entries?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Yes, delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
