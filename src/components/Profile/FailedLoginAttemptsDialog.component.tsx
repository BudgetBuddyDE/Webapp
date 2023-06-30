import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    type DialogProps,
    DialogTitle,
    Slide,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export type FailedLoginAttemptsDialogProps = DialogProps & {
    onCancel: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    onResetPassword: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export const FailedLoginAttemptsDialog: React.FC<FailedLoginAttemptsDialogProps> = ({
    onCancel,
    onResetPassword,
    ...dialogProps
}) => {
    return (
        <Dialog TransitionComponent={Transition} keepMounted PaperProps={{ elevation: 0 }} {...dialogProps}>
            <DialogTitle>Reset password?</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    You've tried to login multiple times without success in a short time period.
                    <br />
                    Do you wanna reset your password?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button variant="contained" onClick={onResetPassword}>
                    Reset password
                </Button>
            </DialogActions>
        </Dialog>
    );
};
