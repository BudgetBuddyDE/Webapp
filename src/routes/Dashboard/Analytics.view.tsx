import React from 'react';
import {useNavigate} from 'react-router-dom';
import {FullScreenDialog, TFullScreenDialogProps} from '@/components/Base';

export type TAnalyticsViewProps =
  | {navigateOnClose: true; navigateTo: string}
  | ({navigateOnClose: false} & Pick<TFullScreenDialogProps, 'onClose'>);

export const AnalyticsView: React.FC<TAnalyticsViewProps> = props => {
  const navigate = useNavigate();
  const handleClose = () => {
    if (props.navigateOnClose) {
      navigate(props.navigateTo);
    } else props.onClose();
  };
  return (
    <FullScreenDialog title={'Analytics'} open={true} onClose={handleClose}>
      Some analytics content
    </FullScreenDialog>
  );
};

export default AnalyticsView;
