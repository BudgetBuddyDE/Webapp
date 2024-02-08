export type TTempStock = {
  name: string;
  isin: string;
  wkn: string;
  exchange: string;
};

export * from './StockPrice.component';
export * from './StockList.component';
export * from './EditStockPositionDrawer.component';
export * from './PortfolioDiversityChart.component';
export * from './PriceChart.component';
export * from './Stock.service';
export * from './StockExchangeAutocomplete.component';
export * from './StockNews.component';
export * from './AddStockPositionDrawer.component';
export * from './SearchStock.component';

export const StockExchanges: TStockExchange[] = [
  ...new Set([
    {
      country: 'Germany',
      exchange: 'langschwarz',
      label: 'Lang & Schwarz Börse Stuttgart AG',
      symbol: 'LSX',
    },
    {
      country: 'Germany',
      exchange: 'frankfurt',
      label: 'Frankfurt Stock Exchange',
      symbol: 'FRA',
    },
    {
      country: 'Germany',
      exchange: 'gettex',
      symbol: 'GETTEX',
      label: 'Gettex',
    },
    {
      country: 'Germany',
      exchange: 'xetra',
      symbol: 'XETRA',
      label: 'Xetra',
    },
  ]),
];

export type TStockExchange = {
  symbol: string;
  exchange: string;
  label: string;
  country: string;
};

export type TStock = {
  symbol: string;
  quotes: TStockQuote[];
};

/**
 * Returned by https://api.parqet.com/v1/quotes/2024-02-09?identifier=US56035L1044&splitAdjusted=true&currency=EUR&exchange=langschwarz&expand=asset
 */
export type TStockQuote = {
  currency: string;
  exchange: string;
  date: Date;
  datetime: Date;
  price: number;
  isin: string;
  cachedAt: Date;
};

export type TStockPosition = {
  boughtAt: Date;
  name: string;
  symbol: string;
  isin: string;
  exchange: TStockExchange;
  currency: string;
  buyIn: number;
  quote: TStockQuote;
  amount: number;
};

// {
//     "currency": "EUR",
//     "exchange": "langschwarz",
//     "date": "2024-02-09",
//     "datetime": "2024-02-09T11:17:42.000Z",
//     "price": 41.44,
//     "isin": "US56035L1044",
//     "cachedAt": "2024-02-09T11:17:43.211Z"
// }
