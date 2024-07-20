import {format} from 'date-fns';

import {type TFilters} from '@/components/Filter';

/**
 * Service for building transaction filter queries.
 */
export class FilterService {
  /**
   * Returns a string representation of the start date filter condition.
   * The condition is in the format: `processed_at >= "yyyy-MM-dd"`.
   *
   * @param date - The start date to format.
   * @returns The formatted start date filter condition.
   */
  static getStartDateString(date: NonNullable<TFilters['startDate']>): string {
    return `processed_at >= "${format(date, 'yyyy-MM-dd')}"`;
  }

  /**
   * Returns a string representing the end date filter condition for a query.
   * The condition is in the format: `processed_at <= "yyyy-MM-dd"`.
   *
   * @param date - The end date for the filter.
   * @returns The end date filter condition.
   */
  static getEndDateString(date: NonNullable<TFilters['endDate']>): string {
    return `processed_at <= "${format(date, 'yyyy-MM-dd')}"`;
  }

  /**
   * Returns a string representation of the given categories array.
   * Each category is enclosed in parentheses and separated by '||' operator.
   *
   * @param categories - The categories array to convert to a string.
   * @returns The string representation of the categories array.
   */
  static getCategoryString(categories: NonNullable<TFilters['categories']>): string {
    return `(${categories.map(c => `category = "${c}"`).join(' || ')})`;
  }

  /**
   * Returns a string representing the payment methods filter.
   *
   * @param paymentMethods - The payment methods to include in the filter.
   * @returns A string representing the payment methods filter.
   */
  static getPaymentMethodString(paymentMethods: NonNullable<TFilters['paymentMethods']>): string {
    return `(${paymentMethods.map(c => `payment_method = "${c}"`).join(' || ')})`;
  }

  /**
   * Returns a string representation of the start price filter condition.
   * @param priceFrom - The minimum price value for the filter.
   * @returns A string representing the filter condition.
   */
  static getStartPriceString(priceFrom: NonNullable<TFilters['priceFrom']>): string {
    return `transfer_amount >= ${priceFrom}`;
  }

  /**
   * Returns a string representation of the end price filter condition.
   * The condition is in the form of `transfer_amount <= priceTo`.
   *
   * @param priceTo - The maximum price value for the filter.
   * @returns The string representation of the end price filter condition.
   */
  static getEndPriceString(priceTo: NonNullable<TFilters['priceTo']>): string {
    return `transfer_amount <= ${priceTo}`;
  }

  /**
   * Locally filters an array of items by a keyword.
   * @param items - The array of items to filter.
   * @param keys - The keys to search for the keyword in each item.
   * @param keyword - The keyword to filter by.
   * @returns The filtered array of items.
   */
  static locallyFilterByKeyword<T>(items: T[], keys: (keyof T)[], keyword: string): T[] {
    if (!keyword) return items;
    return items.filter(item => {
      for (const key of keys) {
        const value = item[key];
        if (typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Builds a transaction filter query based on the provided filters.
   * @param filters - The filters to apply to the query.
   * @returns The transaction filter query as a string.
   */
  static buildTransactionFilterQuery(filters?: TFilters): string | undefined {
    if (!filters) return '';
    const query = [] as string[];
    if (filters.startDate) query.push(this.getStartDateString(filters.startDate));
    if (filters.endDate) query.push(this.getEndDateString(filters.endDate));
    if (filters.categories && filters.categories.length > 0) {
      query.push(this.getCategoryString(filters.categories));
    }
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      query.push(this.getPaymentMethodString(filters.paymentMethods));
    }
    if (filters.priceFrom !== undefined && filters.priceFrom !== null) {
      query.push(this.getStartPriceString(filters.priceFrom));
    }
    if (filters.priceTo !== undefined && filters.priceTo !== null) {
      query.push(this.getEndPriceString(filters.priceTo));
    }
    if (filters.keyword !== undefined && filters.keyword !== null && filters.keyword.length > 0) {
      const escapedKeyword = filters.keyword.replace(/"/g, '\\"');
      query.push(`(receiver~'%${escapedKeyword}%' || information~'%${escapedKeyword}%')`);
    }
    return query.join(' && ');
  }

  /**
   * Builds a subscription filter query based on the provided filters.
   * @param filters - The filters to apply to the query.
   * @returns The subscription filter query as a string.
   */
  static buildSubscriptionFilterQuery(filters?: TFilters): string {
    if (!filters) return '';
    const query = [] as string[];
    // FIXME: Temporarily removed
    // if (filters.startDate) {
    //   query.push(`execute_at >= "${format(filters.startDate, 'dd')}"`);
    // }
    // if (filters.endDate) {
    //   query.push(`execute_at <= "${format(filters.endDate, 'dd')}"`);
    // }
    if (filters.categories && filters.categories.length > 0) {
      query.push(this.getCategoryString(filters.categories));
    }
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      query.push(this.getPaymentMethodString(filters.paymentMethods));
    }
    if (filters.priceFrom !== undefined && filters.priceFrom !== null) {
      query.push(this.getStartPriceString(filters.priceFrom));
    }
    if (filters.priceTo !== undefined && filters.priceTo !== null) {
      query.push(this.getEndPriceString(filters.priceTo));
    }
    if (filters.keyword !== undefined && filters.keyword !== null && filters.keyword.length > 0) {
      const escapedKeyword = filters.keyword.replace(/"/g, '\\"');
      query.push(`(receiver~'%${escapedKeyword}%' || information~'%${escapedKeyword}%')`);
    }
    return query.join(' && ');
  }

  /**
   * Builds a payment method filter query based on the provided filters.
   * @param filters - The filters to apply to the query.
   * @returns The built filter query as a string.
   */
  static buildPaymentMethodFilterQuery(filters?: TFilters): string {
    if (!filters) return '';
    const query = [] as string[];
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      query.push(this.getPaymentMethodString(filters.paymentMethods));
    }
    if (filters.keyword !== undefined && filters.keyword !== null && filters.keyword.length > 0) {
      const escapedKeyword = filters.keyword.replace(/"/g, '\\"');
      query.push(`(name~'%${escapedKeyword}%' || description~'%${escapedKeyword}%')`);
    }
    return query.join(' && ');
  }

  /**
   * Builds a category filter query based on the provided filters.
   * @param filters - The filters to apply.
   * @returns The category filter query string.
   */
  static buildCategoryFilterQuery(filters?: TFilters): string {
    if (!filters) return '';
    const query = [] as string[];
    if (filters.categories && filters.categories.length > 0) {
      query.push(this.getCategoryString(filters.categories));
    }
    if (filters.keyword !== undefined && filters.keyword !== null && filters.keyword.length > 0) {
      const escapedKeyword = filters.keyword.replace(/"/g, '\\"');
      query.push(`(name~'%${escapedKeyword}%' || description~'%${escapedKeyword}%')`);
    }
    return query.join(' && ');
  }
}
