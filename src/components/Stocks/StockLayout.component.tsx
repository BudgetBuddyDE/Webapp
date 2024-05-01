import React from 'react';

import {useKeyPress} from '@/hooks';

import {SearchStockDialog, type TSearchStockDialogProps} from './SearchStockDialog.component';

/**
 * Props for the StockLayout component.
 */
export type TStockLayoutProps = React.PropsWithChildren<
  Pick<TSearchStockDialogProps, 'onSelectAsset' | 'onOpenPosition' | 'onWatchlistInteraction'>
>;

/**
 * StockLayout component is responsible for rendering the layout for stocks.
 * It provides a dialog for searching and selecting stocks, and handles user interactions.
 *
 * @component
 * @example
 * return (
 *   <StockLayout
 *     onSelectAsset={handleSelectAsset}
 *     onOpenPosition={handleOpenPosition}
 *     onWatchlistInteraction={handleWatchlistInteraction}
 *   >
 *     {children}
 *   </StockLayout>
 * );
 */
export const StockLayout: React.FC<TStockLayoutProps> = ({
  onSelectAsset,
  onOpenPosition,
  onWatchlistInteraction,
  children,
}) => {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const [showStockDialog, setShowStockDialog] = React.useState(false);

  useKeyPress(
    ['k'],
    event => {
      event.preventDefault();
      setShowStockDialog(true);
    },
    dialogRef.current,
    true,
  );

  return (
    <React.Fragment>
      {children}
      <SearchStockDialog
        ref={dialogRef}
        open={showStockDialog}
        onClose={() => setShowStockDialog(false)}
        onSelectAsset={
          onSelectAsset
            ? asset => {
                setShowStockDialog(false);
                onSelectAsset(asset);
              }
            : undefined
        }
        onOpenPosition={
          onOpenPosition
            ? asset => {
                setShowStockDialog(false);
                onOpenPosition(asset);
              }
            : undefined
        }
        onWatchlistInteraction={
          onWatchlistInteraction
            ? (event, asset) => {
                setShowStockDialog(false);
                onWatchlistInteraction(event, asset);
              }
            : undefined
        }
      />
    </React.Fragment>
  );
};
