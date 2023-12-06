import { Transaction } from '@/models/Transaction.model';
import type { Filter } from '@/type/filter.type';
import { filterTransactions } from '@/util/filter.util';

describe('filterTransactions', () => {
  const transactions = [
    new Transaction({
      id: 1,
      categories: { id: 1, name: 'Category 1', description: 'Category 1 description' },
      paymentMethods: {
        id: 1,
        name: 'Payment Method 1',
        address: 'Payment Method 1 address',
        provider: 'Payment Provider 1',
        description: 'Payment Method 1 description',
      },
      receiver: 'Receiver 1',
      description: 'Transaction 1',
      amount: 100,
      date: new Date('2023-06-01').toString(),
      created_by: 'user1',
      updated_at: new Date().toString(),
      inserted_at: new Date().toString(),
    }),
    new Transaction({
      id: 2,
      categories: { id: 2, name: 'Category 2', description: 'Category 2 description' },
      paymentMethods: {
        id: 2,
        name: 'Payment Method 2',
        address: 'Payment Method 2 address',
        provider: 'Payment Provider 2',
        description: 'Payment Method 2 description',
      },
      receiver: 'Receiver 2',
      description: 'Transaction 2',
      amount: 200,
      date: new Date('2023-06-02').toString(),
      created_by: 'user2',
      updated_at: new Date().toString(),
      inserted_at: new Date().toString(),
    }),
    new Transaction({
      id: 3,
      categories: { id: 3, name: 'Category 3', description: 'Category 3 description' },
      paymentMethods: {
        id: 3,
        name: 'Payment Method 3',
        address: 'Payment Method 3 address',
        provider: 'Payment Provider 3',
        description: 'Payment Method 3 description',
      },
      receiver: 'Receiver 3',
      description: 'Transaction 3',
      amount: 300,
      date: new Date('2023-06-03').toString(),
      created_by: 'user3',
      updated_at: new Date().toString(),
      inserted_at: new Date().toString(),
    }),
  ];

  test('filter by keyword', () => {
    const filter: Filter = {
      keyword: 'Transaction 2',
      categories: null,
      paymentMethods: null,
      dateFrom: null,
      dateTo: null,
      priceFrom: null,
      priceTo: null,
    };

    const filteredTransactions = filterTransactions(filter.keyword as string, filter, transactions);

    expect(filteredTransactions.length).toBe(1);
    expect(filteredTransactions[0].id).toBe(2);
  });

  test('filter by date range', () => {
    const filter: Filter = {
      keyword: null,
      categories: null,
      paymentMethods: null,
      dateFrom: new Date('2023-06-02'),
      dateTo: new Date('2023-06-03'),
      priceFrom: null,
      priceTo: null,
    };

    const filteredTransactions = filterTransactions('', filter, transactions);

    expect(filteredTransactions.length).toBe(2);
    expect(filteredTransactions[0].id).toBe(2);
    expect(filteredTransactions[1].id).toBe(3);
  });

  test('filter by categories', () => {
    const filter: Filter = {
      keyword: null,
      categories: [1, 3],
      paymentMethods: null,
      dateFrom: null,
      dateTo: null,
      priceFrom: null,
      priceTo: null,
    };

    const filteredTransactions = filterTransactions('', filter, transactions);

    expect(filteredTransactions.length).toBe(2);
    expect(filteredTransactions[0].id).toBe(1);
    expect(filteredTransactions[1].id).toBe(3);
  });

  test('filter by payment methods', () => {
    const filter: Filter = {
      keyword: null,
      categories: null,
      paymentMethods: [2],
      dateFrom: null,
      dateTo: null,
      priceFrom: null,
      priceTo: null,
    };

    const filteredTransactions = filterTransactions('', filter, transactions);

    expect(filteredTransactions.length).toBe(1);
    expect(filteredTransactions[0].id).toBe(2);
  });

  test('filter by price range', () => {
    const filter: Filter = {
      keyword: null,
      categories: null,
      paymentMethods: null,
      dateFrom: null,
      dateTo: null,
      priceFrom: 200,
      priceTo: 300,
    };

    const filteredTransactions = filterTransactions('', filter, transactions);

    expect(filteredTransactions.length).toBe(2);
    expect(filteredTransactions[0].id).toBe(2);
    expect(filteredTransactions[1].id).toBe(3);
  });
});
