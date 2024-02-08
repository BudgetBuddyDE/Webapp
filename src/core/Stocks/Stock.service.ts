import { z } from 'zod';
import { prepareRequestOptions } from '@/utils';
import { type IAuthContext } from '../Auth';
import { type TStockExchange } from './index';
import { type TStockExchangeInputOption } from './StockExchangeAutocomplete.component';
import { isRunningInProdEnv } from '@/utils/isRunningInProdEnv.util';
import { type TApiResponse, TServiceResponse } from '@budgetbuddyde/types';

export class StockService {
  private static host = isRunningInProdEnv()
    ? (process.env.FILE_SERVICE_HOST as string)
    : '/stock_service';

  static getStockExchangeInputOptionFromList(
    exchange: TStockExchange,
    stockExchanges: TStockExchange[]
  ): TStockExchangeInputOption | undefined {
    const unqiueExchanges = [...new Set(stockExchanges)];
    const match = unqiueExchanges.find((se) => se.exchange === exchange.exchange);
    if (!match) return undefined;
    return match;
  }

  static async getPositions({
    uuid,
    password,
  }: IAuthContext['authOptions']): Promise<TServiceResponse<TStockPosition[]>> {
    try {
      const response = await fetch(this.host + '/v1/stock/position', {
        ...prepareRequestOptions({ uuid, password }),
      });
      const json = (await response.json()) as TApiResponse<TStockPosition[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZStockPosition).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}

export const ZStockPosition = z.object({
  id: z.number(),
  owner: z.string().uuid(),
  bought_at: z.string(),
  exchange: z.object({
    symbol: z.string(),
    name: z.string(),
    exchange: z.string(),
    country: z.string(),
  }),
  name: z.string(),
  logo: z.string(),
  isin: z.string(),
  buy_in: z.number(),
  currency: z.string(),
  quantity: z.number(),
  created_at: z.string(),
  volume: z.number(),
  quote: z.object({
    currency: z.string(),
    exchange: z.string(),
    date: z.string(),
    datetime: z.string(),
    price: z.number(),
    isin: z.string(),
    cachedAt: z.string(),
  }),
});
export type TStockPosition = z.infer<typeof ZStockPosition>;
