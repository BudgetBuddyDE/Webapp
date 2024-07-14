import {describe, expect, it} from 'vitest';

import {type TFilters} from '@/components/Filter';

import {FilterService} from './Filter.service';

describe('FilterService', () => {
  describe('Validate generic query-builder methods', () => {
    it('it should return the start date', () => {
      const result = FilterService.getStartDateString(new Date('2022-01-01'));
      expect(result).toBe('processed_at >= "2022-01-01"');
    });

    it('it should return the end date', () => {
      const result = FilterService.getEndDateString(new Date('2022-01-31'));
      expect(result).toBe('processed_at <= "2022-01-31"');
    });

    it('it should return the category string', () => {
      const result = FilterService.getCategoryString(['category_id_1', 'category_id_2']);
      expect(result).toBe('(category = "category_id_1" || category = "category_id_2")');
    });

    it('it should return the payment method string', () => {
      const result = FilterService.getPaymentMethodString(['payment_method_id_1', 'payment_method_id_2']);
      expect(result).toBe('(payment_method = "payment_method_id_1" || payment_method = "payment_method_id_2")');
    });

    it('it should return the start price string', () => {
      const result = FilterService.getStartPriceString(10);
      expect(result).toBe('transfer_amount >= 10');
    });

    it('it should return the end price string', () => {
      const result = FilterService.getEndPriceString(100);
      expect(result).toBe('transfer_amount <= 100');
    });

    it('it should return the keyword string', () => {
      const result = FilterService.getKeywordString('coffee');
      expect(result).toBe("(receiver~'%coffee%' || information~'%coffee%')");
    });

    it('it should escape double quotes in keyword', () => {
      const result = FilterService.getKeywordString('John "Doe"');
      expect(result).toBe('(receiver~\'%John \\"Doe\\"%\' || information~\'%John \\"Doe\\"%\')');
    });
  });

  describe('buildTransactionFilterQuery', () => {
    it('should return undefined if no filters are provided', () => {
      const result = FilterService.buildTransactionFilterQuery();
      expect(result).toBeUndefined();
    });

    it('should build a transaction filter query with start date', () => {
      const filters = {startDate: new Date('2022-01-01')} as TFilters;
      const result = FilterService.buildTransactionFilterQuery(filters);
      expect(result).toBe('processed_at >= "2022-01-01"');
    });

    it('should build a transaction filter query with end date', () => {
      const filters = {endDate: new Date('2022-01-31')} as TFilters;
      const result = FilterService.buildTransactionFilterQuery(filters);
      expect(result).toBe('processed_at <= "2022-01-31"');
    });

    it('should build a transaction filter query with categories', () => {
      const filters = {categories: ['category_id_1', 'category_id_2']} as TFilters;
      const result = FilterService.buildTransactionFilterQuery(filters);
      expect(result).toBe('(category = "category_id_1" || category = "category_id_2")');
    });

    it('should build a transaction filter query with payment methods', () => {
      const filters = {paymentMethods: ['payment_method_id_1', 'payment_method_id_2']} as TFilters;
      const result = FilterService.buildTransactionFilterQuery(filters);
      expect(result).toBe('(payment_method = "payment_method_id_1" || payment_method = "payment_method_id_2")');
    });

    it('should build a transaction filter query with price range', () => {
      const filters = {priceFrom: 10, priceTo: 100} as TFilters;
      const result = FilterService.buildTransactionFilterQuery(filters);
      expect(result).toBe('transfer_amount >= 10 && transfer_amount <= 100');
    });

    it('should build a transaction filter query with keyword', () => {
      const filters = {keyword: 'coffee'} as TFilters;
      const result = FilterService.buildTransactionFilterQuery(filters);
      expect(result).toBe("(receiver~'%coffee%' || information~'%coffee%')");
    });

    it('should escape double quotes in keyword', () => {
      const filters = {keyword: 'John "Doe"'} as TFilters;
      const result = FilterService.buildTransactionFilterQuery(filters);
      expect(result).toBe('(receiver~\'%John \\"Doe\\"%\' || information~\'%John \\"Doe\\"%\')');
    });

    it('should build a transaction filter query with all filters', () => {
      const filters = {
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-01-31'),
        categories: ['category_id_1', 'category_id_2'],
        paymentMethods: ['payment_method_id_1', 'payment_method_id_2'],
        priceFrom: 10,
        priceTo: 100,
        keyword: 'coffee',
      } as TFilters;
      const result = FilterService.buildTransactionFilterQuery(filters);
      expect(result).toBe(
        'processed_at >= "2022-01-01" && processed_at <= "2022-01-31" && ' +
          '(category = "category_id_1" || category = "category_id_2") && ' +
          '(payment_method = "payment_method_id_1" || payment_method = "payment_method_id_2") && ' +
          'transfer_amount >= 10 && transfer_amount <= 100 && ' +
          "(receiver~'%coffee%' || information~'%coffee%')",
      );
    });
  });
});
