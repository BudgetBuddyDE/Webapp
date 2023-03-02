import { faker } from '@faker-js/faker';
import { isSameMonth } from 'date-fns';
import { Transaction } from '../../models';
import { TransactionService } from '../../services';
import type { uuid } from '../../types';
import { getRandomFromList } from '../../utils';
import { generateRandomId } from '../generateRandomId';
import { Categories, generateCategories } from './categories';
import { PaymentMethods, generatePaymentMethods } from './payment-methods';

export function generateTransactions(
  amount = 10,
  date = new Date(),
  categories = generateCategories(),
  paymentMethods = generatePaymentMethods()
): Transaction[] {
  return Array.from({ length: amount }).map(() => {
    return new Transaction({
      id: generateRandomId(),
      date: date.toString(),
      amount: -10, // Number(faker.finance.amount(-100, 100))
      receiver: faker.company.name(),
      description: faker.finance.transactionDescription(),
      categories: getRandomFromList(categories).categoryView,
      paymentMethods: getRandomFromList(paymentMethods).paymentMethodView,
      created_by: '' as uuid,
      updated_at: date.toString(),
      inserted_at: date.toString(),
    });
  });
}

export function generateTransactionList(
  categories = generateCategories(),
  paymentMethods = generatePaymentMethods()
): Transaction[] {
  const FUTURE_TRANSACTIONS = generateTransactions(5, faker.date.soon(5), categories, paymentMethods);
  const TODAYS_TRANSACTIONS = generateTransactions(3, new Date(), categories, paymentMethods);
  const PAST_TRANSACTIONS = generateTransactions(20, faker.date.past(20), categories, paymentMethods);

  return [...FUTURE_TRANSACTIONS, ...TODAYS_TRANSACTIONS, ...PAST_TRANSACTIONS].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export const Transactions: Transaction[] = [
  new Transaction({
    id: 1,
    categories: Categories[5].categoryView,
    paymentMethods: PaymentMethods[0].paymentMethodView,
    receiver: 'Lego Set',
    description: null,
    amount: -9,
    date: '01-02-2022',
    created_by: 'unit-test',
    inserted_at: '01-01-2022',
    updated_at: '01-01-2022',
  }),
  new Transaction({
    id: 2,
    categories: Categories[5].categoryView,
    paymentMethods: PaymentMethods[0].paymentMethodView,
    receiver: 'Unknown lego fan',
    description: 'Sold my old lego set',
    amount: 29,
    date: '01-03-2022',
    created_by: 'unit-test',
    inserted_at: '01-01-2022',
    updated_at: '01-01-2022',
  }),
  new Transaction({
    id: 3,
    categories: Categories[5].categoryView,
    paymentMethods: PaymentMethods[0].paymentMethodView,
    receiver: 'Ford car dealership',
    description: 'Sold my car',
    amount: 2900,
    date: '01-20-2022',
    created_by: 'unit-test',
    inserted_at: '01-01-2022',
    updated_at: '01-01-2022',
  }),
];
