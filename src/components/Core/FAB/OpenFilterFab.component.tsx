import React from 'react';
import { StoreContext } from '@/context/Store.context';
import { TuneRounded as TuneIcon } from '@mui/icons-material';
import { Fab } from '@mui/material';

export const OpenFilterFab = () => {
    const { setShowFilterDrawer } = React.useContext(StoreContext);
    return (
        <Fab color="primary" size="medium" aria-label="open-filter" onClick={() => setShowFilterDrawer(true)}>
            <TuneIcon />
        </Fab>
    );
};
