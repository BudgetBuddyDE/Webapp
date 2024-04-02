import {z} from 'zod';
import {preparePockebaseRequestOptions} from '@/utils';
import {isRunningInProdEnv} from '@/utils/isRunningInProdEnv.util';
import {
  ApiResponse,
  type TId,
  type TApiResponse,
  type TServiceResponse,
  type TStockExchange,
  type TStockPositionWithQuote,
  type TUpdateStockPositionPayload,
  ZStockExchange,
  ZStockPositionWithQuote,
  ZDividendDetails,
  ZAssetSearchResult,
  ZStockQuote,
  ZAssetChartQuote,
  ZAssetDetails,
  type TDividendDetailList,
  type TAssetSearchResult,
  type TStockQuote,
  type TTimeframe,
  type TAssetChartQuote,
  type TDividendDetails,
  type TAssetDetails,
  TCreateStockPositionPayload,
} from '@budgetbuddyde/types';
import {type TSelectStockExchangeOption} from '@/components/Stocks/Exchange';

export class StockService {
  private static host = isRunningInProdEnv() ? (process.env.STOCK_SERVICE_HOST as string) : '/stock_service';

  /**
   * Retrieves a stock exchange input option from a list of stock exchanges based on the exchange ticker.
   *
   * @param exchangeTicker - The ticker symbol of the stock exchange.
   * @param stockExchanges - The list of stock exchanges to search from.
   * @returns The matching stock exchange input option, or undefined if no match is found.
   */
  static getStockExchangeInputOptionFromList(
    exchangeTicker: string,
    stockExchanges: TSelectStockExchangeOption[],
  ): TSelectStockExchangeOption | undefined {
    const match = stockExchanges.find(se => se.ticker === exchangeTicker);
    if (!match) return undefined;
    return match;
  }

  /**
   * Transforms an array of dividend details into a new array of transformed dividend objects.
   * @param dividends - An array of dividend details.
   * @returns An array of transformed dividend objects.
   */
  static transformDividendDetails(dividends: TDividendDetails[]) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return Object.entries(dividends).flatMap(([_, data]) => {
      const companyInfo = data.asset;
      const upcomingDividends = data.futureDividends;
      if (!upcomingDividends) return [];
      return upcomingDividends
        .map(
          ({date, currency, exDate, isEstimated, paymentDate, price, originalCurrency, originalPrice, type}, index) => {
            return {
              companyInfo,
              dividend: {
                currency,
                exDate,
                isEstimated,
                paymentDate,
                price,
                originalCurrency,
                originalPrice,
                type,
              },
              key: `${date}-${index}`,
            };
          },
        )
        .reverse();
    });
  }

  /**
   * Retrieves asset details for a given ISIN.
   * @param isin - The ISIN of the asset.
   * @returns A promise that resolves to a tuple containing the asset details and any error that occurred during the retrieval.
   */
  static async getAssetDetails(isin: string): Promise<TServiceResponse<TAssetDetails>> {
    try {
      const response = await fetch(`${this.host}/v1/asset/details/${isin}`, {
        ...preparePockebaseRequestOptions(),
      });
      const json = (await response.json()) as TApiResponse<TAssetDetails>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZAssetDetails.safeParse(json.data);
      if (!parsingResult.success) throw parsingResult.error;
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async openPositions(
    payload: TCreateStockPositionPayload,
  ): Promise<TServiceResponse<TStockPositionWithQuote[]>> {
    try {
      const response = await fetch(this.host + '/v1/asset/position', {
        method: 'POST',
        body: JSON.stringify(payload),
        ...preparePockebaseRequestOptions(),
      });
      const json = (await response.json()) as TApiResponse<TStockPositionWithQuote[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZStockPositionWithQuote).safeParse(json.data);
      if (!parsingResult.success) throw parsingResult.error;
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async getPositions(): Promise<TServiceResponse<TStockPositionWithQuote[]>> {
    try {
      const response = await fetch(this.host + '/v1/asset/position', {
        ...preparePockebaseRequestOptions(),
      });
      const json = (await response.json()) as TApiResponse<TStockPositionWithQuote[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZStockPositionWithQuote).safeParse(json.data);
      if (!parsingResult.success) throw parsingResult.error;
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async updatePositions(
    payload: TUpdateStockPositionPayload,
  ): Promise<TServiceResponse<TStockPositionWithQuote[]>> {
    try {
      const response = await fetch(this.host + '/v1/asset/position', {
        method: 'PUT',
        body: JSON.stringify(payload),
        ...preparePockebaseRequestOptions(),
      });
      const json = (await response.json()) as TApiResponse<TStockPositionWithQuote[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZStockPositionWithQuote).safeParse(json.data);
      if (!parsingResult.success) throw parsingResult.error;
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async deletePosition(payload: {id: TId}): Promise<TServiceResponse<{success: boolean}>> {
    try {
      const response = await fetch(this.host + '/v1/asset/position/', {
        method: 'DELETE',
        body: JSON.stringify(payload),
        ...preparePockebaseRequestOptions(),
      });
      const json = (await response.json()) as TApiResponse<{success: boolean}>;
      if (json.status != 200 || (json.data && !json.data.success)) {
        return [null, new Error(json.message!)];
      }

      const parsingResult = z.object({success: z.boolean()}).safeParse(json.data);
      if (!parsingResult.success) throw parsingResult.error;
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async getQuote(asset: string, exchange: string): Promise<TServiceResponse<TStockQuote>> {
    try {
      const query = new URLSearchParams();
      query.append('asset', asset);
      query.append('exchange', exchange);

      const response = await fetch(this.host + '/v1/asset/quote?' + query.toString(), {
        ...preparePockebaseRequestOptions(),
      });
      const json = (await response.json()) as TApiResponse<TStockQuote>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZStockQuote.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async getQuotes(
    assets: string[],
    exchange: string,
    timeframe: TTimeframe,
  ): Promise<TServiceResponse<TAssetChartQuote[]>> {
    try {
      const query = new URLSearchParams();
      assets.forEach(asset => query.append('assets', asset));
      query.append('exchange', exchange);
      query.append('timeframe', timeframe);

      const response = await fetch(this.host + '/v1/asset/quotes?' + query.toString(), {
        ...preparePockebaseRequestOptions(),
      });
      const json = (await response.json()) as ApiResponse<TAssetChartQuote[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZAssetChartQuote).safeParse(json.data);
      if (!parsingResult.success) throw parsingResult.error;
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async searchAsset(term: string): Promise<TServiceResponse<TAssetSearchResult[]>> {
    try {
      const query = new URLSearchParams();
      query.append('q', term);

      const response = await fetch(`${this.host}/v1/asset/search?${query.toString()}`, {
        ...preparePockebaseRequestOptions(),
      });
      const json = (await response.json()) as TApiResponse<TAssetSearchResult[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZAssetSearchResult).safeParse(json.data);
      if (!parsingResult.success) throw parsingResult.error;
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async getExchanges(): Promise<TServiceResponse<TStockExchange[]>> {
    try {
      const response = await fetch(this.host + '/v1/asset/exchanges', {
        ...preparePockebaseRequestOptions(),
      });
      const json = (await response.json()) as TApiResponse<TStockExchange[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZStockExchange).safeParse(json.data);
      if (!parsingResult.success) throw parsingResult.error;
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async getDividends(assets: string[]): Promise<TServiceResponse<TDividendDetailList['dividendDetails']>> {
    try {
      const query = new URLSearchParams();
      assets.forEach(asset => query.append('assets', asset));

      const response = await fetch(this.host + '/v1/dividend?' + query.toString(), {
        ...preparePockebaseRequestOptions(),
      });
      const json = (await response.json()) as TApiResponse<TDividendDetailList['dividendDetails']>;
      if (json.status != 200) return [null, new Error('Something went wrong')];

      const parsingResult = z.record(z.string(), ZDividendDetails).safeParse(json.data);
      if (!parsingResult.success) throw parsingResult.error;
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }
}
