import {type TAssetSearchResult} from '@budgetbuddyde/types';
import {AddRounded, SearchRounded, StarRounded} from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogContent,
  type DialogProps,
  Grid,
  IconButton,
  CircularProgress as MuiCircularProgress,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {debounce} from 'lodash';
import React from 'react';

import {ActionPaper, Image} from '@/components/Base';
import {CircularProgress} from '@/components/Loading';
import {useSnackbarContext} from '@/components/Snackbar';

import {StockService} from './Stock.service';

/**
 * Props for the SearchStockDialog component.
 */
export type TSearchStockDialogProps = {
  /**
   * Callback function triggered when an asset is selected.
   * @param asset The selected asset.
   */
  onSelectAsset?: (asset: TAssetSearchResult) => void;

  /**
   * Callback function triggered when opening a position for an asset.
   * @param asset The asset for which the position is being opened.
   */
  onOpenPosition?: (asset: TAssetSearchResult) => void;

  /**
   * Callback function triggered when interacting with the watchlist.
   * @param event The type of watchlist interaction ('ADD_TO_WATCHLIST' or 'REMOVE_FROM_WATCHLIST').
   * @param asset The asset being added to or removed from the watchlist.
   */
  onWatchlistInteraction?: (event: 'ADD_TO_WATCHLIST' | 'REMOVE_FROM_WATCHLIST', asset: TAssetSearchResult) => void;
} & DialogProps;

/**
 * SearchStockDialog component displays a dialog for searching and selecting stocks.
 *
 * @component
 * @example
 * return (
 *   <SearchStockDialog
 *     onSelectAsset={handleSelectAsset}
 *     onOpenPosition={handleOpenPosition}
 *     onWatchlistInteraction={handleWatchlistInteraction}
 *     // ...other props
 *   />
 * );
 */
export const SearchStockDialog: React.FC<TSearchStockDialogProps> = ({
  onSelectAsset,
  onOpenPosition,
  onWatchlistInteraction,
  ...dialogProps
}) => {
  const {showSnackbar} = useSnackbarContext();
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<TAssetSearchResult[]>([]);

  const searchStocks = async () => {
    if (searchTerm.length < 1) return setSearchResults([]);
    setLoading(true);
    try {
      const [matches, error] = await StockService.searchAsset(searchTerm);
      if (error) throw error;
      if (!matches) return setSearchResults([]);
      console.log(matches);
      setSearchResults(matches);
    } catch (err) {
      console.error(err);
      showSnackbar({message: 'Error fetching stocks'});
    }
    setLoading(false);
  };

  React.useEffect(() => {
    searchStocks();
  }, [searchTerm]);

  return (
    <Dialog fullWidth scroll={'paper'} PaperProps={{elevation: 0}} {...dialogProps}>
      <Box sx={{p: 2}}>
        <TextField
          placeholder="Search stock"
          onChange={debounce(e => setSearchTerm(e.target.value), 500)}
          fullWidth
          inputRef={input => input && input.focus()}
          InputProps={{
            startAdornment: <SearchRounded sx={{mr: 1}} />,
            endAdornment: loading && <MuiCircularProgress size={26} />,
          }}
        />
      </Box>
      {loading && searchResults.length === 0 ? (
        <CircularProgress />
      ) : searchResults.length > 0 ? (
        <DialogContent sx={{maxHeight: theme => theme.spacing(40), p: 2}} dividers>
          {searchResults.map(asset => (
            <Grid
              key={asset.identifier}
              container
              alignItems="center"
              sx={{
                mb: 1,
                borderRadius: theme => theme.shape.borderRadius + 'px',
                ':hover': onSelectAsset && {
                  backgroundColor: theme => theme.palette.action.hover,
                  cursor: 'pointer',
                },
              }}
              onClick={() => onSelectAsset && onSelectAsset(asset)}>
              <Grid item sx={{display: 'flex', width: '56px'}}>
                <ActionPaper sx={{width: '56px', height: '56px'}}>
                  <Image src={asset.logo} alt={asset.name + ' logo'} sx={{width: 'inherit', height: 'inherit'}} />
                </ActionPaper>
              </Grid>
              <Grid item sx={{flex: 1, wordWrap: 'break-word', pl: 1}}>
                <Typography variant="body1" fontWeight={'bolder'}>
                  {asset.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {asset.type} - {asset.identifier}
                </Typography>
              </Grid>
              {onOpenPosition && (
                <Grid item>
                  <Tooltip title="Open position">
                    <IconButton
                      size="large"
                      color="primary"
                      onClick={event => {
                        event.stopPropagation();
                        onOpenPosition(asset);
                      }}>
                      <AddRounded />
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}
              {onWatchlistInteraction && (
                <Grid item>
                  <Tooltip title="Add to watchlist">
                    <IconButton
                      size="large"
                      color="primary"
                      onClick={event => {
                        event.stopPropagation();
                        onWatchlistInteraction('ADD_TO_WATCHLIST', asset);
                      }}>
                      <StarRounded />
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          ))}
        </DialogContent>
      ) : (
        <ActionPaper sx={{m: 2, mt: 0, p: 2}}>
          <Typography variant={'body1'} textAlign={'center'}>
            {searchTerm.length > 0 ? `No results for '${searchTerm}'!` : 'No results found!'}
          </Typography>
        </ActionPaper>
      )}
    </Dialog>
  );
};
