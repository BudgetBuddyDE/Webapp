import React from 'react';
import {SearchStockDialog, type TSearchStockDialogProps} from './SearchStockDialog.component';
import {useKeyPress} from '@/hooks';

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
        onSelectAsset={asset => {
          setShowStockDialog(false);
          onSelectAsset && onSelectAsset(asset);
        }}
        onOpenPosition={onOpenPosition}
        onWatchlistInteraction={onWatchlistInteraction}
      />
    </React.Fragment>
  );
};
