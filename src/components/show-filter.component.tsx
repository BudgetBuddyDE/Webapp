import { useContext } from 'react';
import { Tooltip, IconButton } from '@mui/material';
import { Tune as TuneIcon } from '@mui/icons-material';
import { StoreContext } from '../context/store.context';

export const ShowFilterButton = () => {
  const { setShowFilter } = useContext(StoreContext);
  return (
    <Tooltip title="Apply filters">
      <IconButton aria-label="apply-filters" onClick={() => setShowFilter(true)}>
        <TuneIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
};
