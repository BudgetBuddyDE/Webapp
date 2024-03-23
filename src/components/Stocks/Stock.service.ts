import { z } from 'zod';
import { prepareRequestOptions } from '@/utils';
import { type IAuthContext } from '../Auth';
import { isRunningInProdEnv } from '@/utils/isRunningInProdEnv.util';
import { ApiResponse, type TApiResponse, type TServiceResponse } from '@budgetbuddyde/types';
import {
  ZDividendDetails,
  ZAssetSearchResult,
  ZStockPosition,
  ZStockQuote,
  ZAssetChartQuote,
  ZMaterializedStockPositionTable,
  ZStockPositionTable,
  type TDividendDetailList,
  type TStockExchanges,
  type TAssetSearchResult,
  type TOpenPositionPayload,
  type TStockPosition,
  type TUpdatePositionPayload,
  type TClosePositionPayload,
  type TStockQuote,
  type TTimeframe,
  type TAssetChartQuote,
  type TMaterializedStockPositionTable,
  type TStockPositionTable,
  type TDividendDetails,
} from './types';
import { type TSelectStockExchangeOption } from './SelectStockExchange.component';

export class StockService {
  private static host = isRunningInProdEnv()
    ? (process.env.STOCK_SERVICE_HOST as string)
    : '/stock_service';

  static getStockExchangeInputOptionFromList(
    exchangeTicker: string,
    stockExchanges: TSelectStockExchangeOption[]
  ): TSelectStockExchangeOption | undefined {
    const match = stockExchanges.find((se) => se.ticker === exchangeTicker);
    if (!match) return undefined;
    return match;
  }

  static transformDividendDetails(dividends: TDividendDetails[]) {
    return Object.entries(dividends).flatMap(([_, data]) => {
      const companyInfo = data.asset;
      const upcomingDividends = data.futureDividends;
      if (!upcomingDividends) return [];
      return upcomingDividends
        .map(
          (
            {
              date,
              currency,
              exDate,
              isEstimated,
              paymentDate,
              price,
              originalCurrency,
              originalPrice,
              type,
            },
            index
          ) => {
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
          }
        )
        .reverse();
    });
  }

  static async openPositions(
    payload: TOpenPositionPayload[],
    authOptions: IAuthContext['authOptions']
  ): Promise<TServiceResponse<TStockPosition[]>> {
    try {
      const response = await fetch(this.host + '/v1/asset/position', {
        method: 'POST',
        body: JSON.stringify(payload),
        ...prepareRequestOptions(authOptions),
      });
      const json = (await response.json()) as TApiResponse<TStockPosition[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZStockPosition).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async getPositions(
    authOptions: IAuthContext['authOptions']
  ): Promise<TServiceResponse<TStockPosition[]>> {
    try {
      const response = await fetch(this.host + '/v1/asset/position', {
        ...prepareRequestOptions(authOptions),
      });
      const json = (await response.json()) as TApiResponse<TStockPosition[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZStockPosition).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async updatePositions(
    payload: TUpdatePositionPayload[],
    authOptions: IAuthContext['authOptions']
  ): Promise<TServiceResponse<TMaterializedStockPositionTable[]>> {
    try {
      const response = await fetch(this.host + '/v1/asset/position', {
        method: 'PUT',
        body: JSON.stringify(payload),
        ...prepareRequestOptions(authOptions),
      });
      const json = (await response.json()) as TApiResponse<TMaterializedStockPositionTable[]>;
      if (json.status != 200) return [null, new Error(json.message!)];
      console.log('json.data', json.data);

      const parsingResult = z.array(ZMaterializedStockPositionTable).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async deletePosition(
    payload: TClosePositionPayload[],
    authOptions: IAuthContext['authOptions']
  ): Promise<TServiceResponse<TStockPositionTable[]>> {
    try {
      const response = await fetch(this.host + '/v1/asset/position/', {
        method: 'DELETE',
        body: JSON.stringify(payload),
        ...prepareRequestOptions(authOptions),
      });
      const json = (await response.json()) as TApiResponse<TStockPositionTable[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZStockPositionTable).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async getQuote(
    asset: string,
    exchange: string,
    authOptions: IAuthContext['authOptions']
  ): Promise<TServiceResponse<TStockQuote>> {
    try {
      const query = new URLSearchParams();
      query.append('asset', asset);
      query.append('exchange', exchange);

      const response = await fetch(this.host + '/v1/asset/quote?' + query.toString(), {
        ...prepareRequestOptions(authOptions),
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
    authOptions: IAuthContext['authOptions']
  ): Promise<TServiceResponse<TAssetChartQuote[]>> {
    try {
      const query = new URLSearchParams();
      assets.forEach((asset) => query.append('assets', asset));
      query.append('exchange', exchange);
      query.append('timeframe', timeframe);

      const response = await fetch(this.host + '/v1/asset/quotes?' + query.toString(), {
        ...prepareRequestOptions(authOptions),
      });
      const json = (await response.json()) as ApiResponse<TAssetChartQuote[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZAssetChartQuote).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  /**
   * Searches for an asset based on the provided term.
   * @param term - The search term.
   * @param authOptions - The authentication options.
   * @returns A promise that resolves to a tuple containing the search result data and any error that occurred.
   */
  static async searchAsset(
    term: string,
    authOptions: IAuthContext['authOptions']
  ): Promise<TServiceResponse<TAssetSearchResult[]>> {
    try {
      const query = new URLSearchParams();
      query.append('q', term);

      const response = await fetch(`${this.host}/v1/asset/search?${query.toString()}`, {
        ...prepareRequestOptions(authOptions),
      });
      const json = (await response.json()) as TApiResponse<TAssetSearchResult[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZAssetSearchResult).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  /**
   * Retrieves the stock exchanges.
   * @param authOptions - The authentication options.
   * @returns A promise that resolves to a tuple containing the stock exchanges data and any potential error.
   */
  static async getExchanges(
    authOptions: IAuthContext['authOptions']
  ): Promise<TServiceResponse<TStockExchanges>> {
    return [null, new Error('Not implemented')];
    // try {
    //   const response = await fetch(this.host + '/v1/asset/exchanges', {
    //     ...prepareRequestOptions(authOptions),
    //   });
    //   const json = (await response.json()) as TApiResponse<TStockExchanges>;
    //   if (json.status != 200) return [null, new Error(json.message!)];

    //   const parsingResult = ZStockExchanges.safeParse(json.data);
    //   if (!parsingResult.success) throw new Error(parsingResult.error.message);
    //   return [parsingResult.data, null];
    // } catch (error) {
    //   return [null, error as Error];
    // }
  }

  /**
   * Retrieves dividend details for the specified assets.
   *
   * @param assets - An array of asset names.
   * @param authOptions - The authentication options for the request.
   * @returns A promise that resolves to a tuple containing the dividend details and any error that occurred.
   */
  static async getDividends(
    assets: string[],
    authOptions: IAuthContext['authOptions']
  ): Promise<TServiceResponse<TDividendDetailList['dividendDetails']>> {
    try {
      const query = new URLSearchParams();
      assets.forEach((asset) => query.append('assets', asset));

      const response = await fetch(this.host + '/v1/dividend?' + query.toString(), {
        ...prepareRequestOptions(authOptions),
      });
      const json = (await response.json()) as TApiResponse<TDividendDetailList['dividendDetails']>;
      if (json.status != 200) return [null, new Error('Something went wrong')];

      const parsingResult = z.record(z.string(), ZDividendDetails).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      return [null, error as Error];
    }
  }
}
