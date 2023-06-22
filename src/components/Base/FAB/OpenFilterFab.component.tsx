import React from 'react';
import { StoreContext } from '@/context';
import { Tune as TuneIcon } from '@mui/icons-material';
import { Fab } from '@mui/material';

export const OpenFilterFab = () => {
    const { setShowFilter } = React.useContext(StoreContext);
    return (
        <Fab color="primary" size="medium" aria-label="open-filter" onClick={() => setShowFilter(true)}>
            <TuneIcon />
        </Fab>
    );
};
