import { Transaction } from '@/models/Transaction.model';
import { TransactionService } from '@/services/Transaction.service';

describe('TransactionService', () => {
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
    new Transaction({
      id: 4,
      categories: { id: 4, name: 'Category 4', description: 'Category 4 description' },
      paymentMethods: {
        id: 4,
        name: 'Payment Method 4',
        address: 'Payment Method 4 address',
        provider: 'Payment Provider 4',
        description: 'Payment Method 4 description',
      },
      receiver: 'Receiver 4',
      description: 'Transaction 4',
      amount: -300,
      date: new Date('2023-06-03').toString(),
      created_by: 'user4',
      updated_at: new Date().toString(),
      inserted_at: new Date().toString(),
    }),
    new Transaction({
      id: 5,
      categories: { id: 5, name: 'Category 5', description: 'Category 5 description' },
      paymentMethods: {
        id: 5,
        name: 'Payment Method 5',
        address: 'Payment Method 5 address',
        provider: 'Payment Provider 5',
        description: 'Payment Method 5 description',
      },
      receiver: 'Receiver 5',
      description: 'Transaction 5',
      amount: -300,
      date: new Date('2023-06-01').toString(),
      created_by: 'user5',
      updated_at: new Date().toString(),
      inserted_at: new Date().toString(),
    }),
  ];

  beforeAll(() => {
    const mockedDate = new Date('2023-06-02');
    jest.spyOn(global, 'Date').mockImplementation(() => mockedDate);
  });

  afterAll(() => {
    jest.spyOn(global, 'Date').mockRestore();
  });

  test('calculateUpcomingExpenses', () => {
    const upcomingExpenses = TransactionService.calculateUpcomingExpenses(transactions);
    const expectedTotal = 300;
    expect(new Date()).toBe(new Date('2023-06-02'));
    expect(upcomingExpenses).toBe(expectedTotal);
  });

  test('calculateUpcomingEarnings', () => {
    const upcomingEarnings = TransactionService.calculateUpcomingEarnings(transactions);
    const expectedTotal = 300;
    expect(new Date()).toBe(new Date('2023-06-02'));
    expect(upcomingEarnings).toBe(expectedTotal);
  });

  test('calculatePaidExpenses', () => {
    const paidExpenses = TransactionService.calculatePaidExpenses(transactions);
    const expectedTotal = 300;
    expect(new Date()).toBe(new Date('2023-06-02'));
    expect(paidExpenses).toBe(expectedTotal);
  });
});
