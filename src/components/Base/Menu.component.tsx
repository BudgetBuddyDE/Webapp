import {MoreVertRounded} from '@mui/icons-material';
import {
  Button,
  type ButtonProps,
  MenuItem,
  MenuItemProps,
  Menu as MuiMenu,
  type MenuProps as MuiMenuProps,
} from '@mui/material';
import React from 'react';

export type TMenuProps = {
  buttonProps?: ButtonProps;
  menuProps?: MuiMenuProps;
  actions: MenuItemProps[];
};

export const Menu: React.FC<TMenuProps> = ({buttonProps, menuProps, actions}) => {
  const id = React.useId();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Button onClick={handleClick} children={<MoreVertRounded />} {...buttonProps} />
      <MuiMenu anchorEl={anchorEl} onClose={handleClose} {...menuProps} open={open}>
        {actions.map((action, idx) => (
          <MenuItem
            key={id + idx}
            {...action}
            onClick={event => {
              action.onClick && action.onClick(event);
              handleClose();
            }}
          />
        ))}
      </MuiMenu>
    </React.Fragment>
  );
};
