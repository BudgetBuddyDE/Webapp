import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';
import { Chip, Menu, MenuItem } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context';
import { Category, PaymentMethod } from '../../models';

export type RedirectChipProps = {
    item: Category | PaymentMethod;
};

export const RedirectChip: React.FC<RedirectChipProps> = ({ item }) => {
    const navigate = useNavigate();
    const { setFilter } = React.useContext(StoreContext);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handler = {
        onClick(event: React.MouseEvent<HTMLElement>) {
            setAnchorEl(event.currentTarget);
        },
        onRedirect(type: 'transaction' | 'subscription') {
            setFilter((prev) => ({ ...prev, [item instanceof Category ? 'categories' : 'paymentMethods']: [item.id] }));
            navigate('/' + type + 's');
            handler.onClose();
        },
        onClose() {
            setAnchorEl(null);
        },
    };

    return (
        <React.Fragment>
            <Chip
                label={item.name}
                onClick={handler.onClick}
                onDelete={handler.onClick}
                deleteIcon={<KeyboardArrowDownIcon />}
            />
            <Menu anchorEl={anchorEl} open={open} onClose={handler.onClose} elevation={0}>
                <MenuItem onClick={() => handler.onRedirect('transaction')} dense disableRipple>
                    Transactions
                </MenuItem>
                <MenuItem onClick={() => handler.onRedirect('subscription')} dense disableRipple>
                    Subscriptions
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
};
