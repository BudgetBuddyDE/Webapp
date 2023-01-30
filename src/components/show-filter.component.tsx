import { Tune as TuneIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useContext } from 'react';
import { StoreContext } from '../context/store.context';

export const ShowFilterButton = () => {
  const { setShowFilter } = useContext(StoreContext);
  return (
    <Tooltip title="Apply filters">
      <IconButton aria-label="apply-filters" color="primary" onClick={() => setShowFilter(true)}>
        <TuneIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
};
