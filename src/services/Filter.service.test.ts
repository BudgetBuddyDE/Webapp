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
  });

  describe('buildTransactionFilterQuery', () => {
    it('should return an empty string if no filters are provided', () => {
      const result = FilterService.buildTransactionFilterQuery();
      expect(result).toBe('');
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

  describe('buildSubscriptionFilterQuery', () => {
    it('should return an empty string if no filters are provided', () => {
      const result = FilterService.buildSubscriptionFilterQuery();
      expect(result).toBe('');
    });

    // it('should build a subscription filter query with start date', () => {
    //   const filters = {startDate: new Date('2022-01-01')} as TFilters;
    //   const result = FilterService.buildSubscriptionFilterQuery(filters);
    //   expect(result).toBe('execute_at >= "01"');
    // });

    // it('should build a subscription filter query with end date', () => {
    //   const filters = {endDate: new Date('2022-01-31')} as TFilters;
    //   const result = FilterService.buildSubscriptionFilterQuery(filters);
    //   expect(result).toBe('execute_at <= "31"');
    // });

    it('should build a subscription filter query with keyword', () => {
      const filters = {keyword: 'coffee'} as TFilters;
      const result = FilterService.buildSubscriptionFilterQuery(filters);
      expect(result).toBe("(receiver~'%coffee%' || information~'%coffee%')");
    });

    it('should escape double quotes in keyword', () => {
      const filters = {keyword: 'John "Doe"'} as TFilters;
      const result = FilterService.buildSubscriptionFilterQuery(filters);
      expect(result).toBe('(receiver~\'%John \\"Doe\\"%\' || information~\'%John \\"Doe\\"%\')');
    });

    it('should build a subscription filter query with all filters', () => {
      const filters = {
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-01-31'),
        categories: ['category_id_1', 'category_id_2'],
        paymentMethods: ['payment_method_id_1', 'payment_method_id_2'],
        priceFrom: 10,
        priceTo: 100,
        keyword: 'coffee',
      } as TFilters;
      const result = FilterService.buildSubscriptionFilterQuery(filters);
      expect(result).toBe(
        // 'execute_at >= "01" && execute_at <= "31" && ' +
        '(category = "category_id_1" || category = "category_id_2") && ' +
          '(payment_method = "payment_method_id_1" || payment_method = "payment_method_id_2") && ' +
          'transfer_amount >= 10 && transfer_amount <= 100 && ' +
          "(receiver~'%coffee%' || information~'%coffee%')",
      );
    });
  });

  describe('buildPaymentMethodFilter', () => {
    it('should return an empty string if no filters are provided', () => {
      const result = FilterService.buildPaymentMethodFilterQuery();
      expect(result).toBe('');
    });

    it('it should return the keyword string', () => {
      const filters = {keyword: 'Visa'} as TFilters;
      const result = FilterService.buildPaymentMethodFilterQuery(filters);
      expect(result).toBe("(name~'%Visa%' || description~'%Visa%')");
    });

    it('it should escape double quotes in keyword', () => {
      const filters = {keyword: 'Credit "Visa"'} as TFilters;
      const result = FilterService.buildPaymentMethodFilterQuery(filters);
      expect(result).toBe('(name~\'%Credit \\"Visa\\"%\' || description~\'%Credit \\"Visa\\"%\')');
    });
  });

  describe('buildCategoryFilterQuery', () => {
    it('should return an empty string if no filters are provided', () => {
      const result = FilterService.buildCategoryFilterQuery();
      expect(result).toBe('');
    });

    it('it should return the keyword string', () => {
      const filters = {keyword: 'coffee'} as TFilters;
      const result = FilterService.buildCategoryFilterQuery(filters);
      expect(result).toBe("(name~'%coffee%' || description~'%coffee%')");
    });

    it('it should escape double quotes in keyword', () => {
      const filters = {keyword: 'buying "coffee"'} as TFilters;
      const result = FilterService.buildCategoryFilterQuery(filters);
      expect(result).toBe('(name~\'%buying \\"coffee\\"%\' || description~\'%buying \\"coffee\\"%\')');
    });
  });
});
