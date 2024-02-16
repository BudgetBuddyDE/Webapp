import React from 'react';
import { Dialog, DialogContent, DialogProps, Slide } from '@mui/material';
import { type TransitionProps } from '@mui/material/transitions';
import { ImageCarousel, type TImageCarouselProps } from './ImageCarousel.component';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export type TImageViewDialogProps = {
  dialogProps?: DialogProps;
  withTransition?: boolean;
} & TImageCarouselProps;

export const ImageViewDialog: React.FC<TImageViewDialogProps> = ({
  dialogProps,
  images,
  withTransition = false,
}) => {
  return (
    <Dialog
      {...dialogProps}
      open={dialogProps ? dialogProps.open : false}
      TransitionComponent={
        withTransition
          ? dialogProps && dialogProps.TransitionComponent
            ? dialogProps.TransitionComponent
            : Transition
          : undefined
      }
      keepMounted
      maxWidth={'md'}
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          aspectRatio: { xs: '1/.9', md: '4 / 3' },
          backgroundColor: 'transparent',
          border: 'none',
        },
      }}
    >
      <DialogContent sx={{ px: 0 }}>
        <ImageCarousel images={images} />
      </DialogContent>
    </Dialog>
  );
};
