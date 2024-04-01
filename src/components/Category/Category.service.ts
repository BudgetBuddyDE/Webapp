import {z} from 'zod';
import {
  ZCategory,
  type TApiResponse,
  type TCategory,
  type TCreateCategoryPayload,
  type TDeleteCategoryPayload,
  type TUpdateCategoryPayload,
  type TDeleteCategoryResponsePayload,
  ZDeleteCategoryResponsePayload,
  type TTransaction,
} from '@budgetbuddyde/types';
import {prepareRequestOptions} from '@/utils';
import {type IAuthContext} from '../Auth';
import {type TCategoryInputOption} from './Autocomplete';
import {subDays} from 'date-fns';
import {isRunningInProdEnv} from '@/utils/isRunningInProdEnv.util';

export class CategoryService {
  private static host = (isRunningInProdEnv() ? (process.env.BACKEND_HOST as string) : '/api') + '/v1/category';

  static async getCategoriesByUuid({
    uuid,
    password,
  }: IAuthContext['authOptions']): Promise<[TCategory[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...prepareRequestOptions({uuid, password}),
      });
      const json = (await response.json()) as TApiResponse<TCategory[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZCategory).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async create(
    category: TCreateCategoryPayload,
    user: IAuthContext['authOptions'],
  ): Promise<[TCategory | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'POST',
        body: JSON.stringify(category),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TCategory>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZCategory.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async update(
    category: TUpdateCategoryPayload,
    user: IAuthContext['authOptions'],
  ): Promise<[TCategory | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'PUT',
        body: JSON.stringify(category),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TCategory>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZCategory.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async delete(
    category: TDeleteCategoryPayload,
    user: IAuthContext['authOptions'],
  ): Promise<[TDeleteCategoryResponsePayload | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'DELETE',
        body: JSON.stringify(category),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TDeleteCategoryResponsePayload>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZDeleteCategoryResponsePayload.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  /**
   * Sorts the autocomplete options for categories based on transaction usage.
   *
   * @param transactions - The list of transactions.
   * @param days - The number of days to consider for transaction usage. Default is 30 days.
   * @returns The sorted autocomplete options for categories.
   */
  static sortAutocompleteOptionsByTransactionUsage(
    categories: TCategory[],
    transactions: TTransaction[],
    days: number = 30,
  ): TCategoryInputOption[] {
    const uniqueCatgegories = categories;
    const now = new Date();
    const startDate = subDays(now, days);
    const categoryFrequencyMap: {[categoryId: string]: number} = {};

    let pastNTransactions = transactions.filter(({processedAt}) => processedAt >= startDate);
    if (pastNTransactions.length < 1) pastNTransactions = transactions.slice(0, 50);
    pastNTransactions.forEach(({category: {id}, processedAt}) => {
      if (processedAt >= startDate && processedAt <= now) {
        categoryFrequencyMap[id] = (categoryFrequencyMap[id] || 0) + 1;
      }
    });

    return this.getAutocompleteOptions(
      uniqueCatgegories
        .map(category => ({
          ...category,
          frequency: categoryFrequencyMap[category.id] || -1,
        }))
        .sort((a, b) => b.frequency - a.frequency),
    );
  }

  /**
   * Returns an array of autocomplete options for the given categories.
   * @param categories - The array of categories.
   * @returns An array of autocomplete options.
   */
  static getAutocompleteOptions(categories: TCategory[]): TCategoryInputOption[] {
    return categories.map(({id, name}) => ({
      label: name,
      value: id,
    }));
  }

  /**
   * Filters an array of categories based on a keyword.
   * @param categories - The array of categories to filter.
   * @param keyword - The keyword to filter the categories by.
   * @returns The filtered array of categories.
   */
  static filter(categories: TCategory[], keyword: string): TCategory[] {
    const lowerKeyword = keyword.toLowerCase();
    return categories.filter(
      ({name, description}) =>
        name.toLowerCase().includes(lowerKeyword) || description?.toLowerCase().includes(lowerKeyword),
    );
  }
}
