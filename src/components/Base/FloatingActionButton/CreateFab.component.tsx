import { Add as AddIcon } from '@mui/icons-material';
import { Fab } from '@mui/material';
import type { FabProps } from '@mui/material';
import React from 'react';

export type CreateFab = {
    onClick: FabProps['onClick'];
};

export const CreateFab: React.FC<CreateFab> = ({ onClick }) => {
    return (
        <Fab color="primary" variant="extended" aria-label="add" onClick={onClick}>
            <AddIcon sx={{ mr: 1 }} />
            Add
        </Fab>
    );
};
