import React from 'react';
import { StoreContext } from '@/context/Store.context';
import { useScreenSize } from '@/hook/useScreenSize.hook';
import { Menu as MenuIcon, MenuOpen as MenuOpenIcon } from '@mui/icons-material';

export const DrawerHamburger = () => {
    const screenSize = useScreenSize();
    const { showDrawer: open } = React.useContext(StoreContext);

    if (screenSize === 'small') {
        return open ? <MenuIcon /> : <MenuOpenIcon />;
    } else return open ? <MenuOpenIcon /> : <MenuIcon />;
};
