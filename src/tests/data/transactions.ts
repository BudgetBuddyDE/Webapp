import { faker } from '@faker-js/faker';
import { Transaction } from '../../models/transaction.model';
import type { uuid } from '../../types/profile.type';
import { getRandomFromList } from '../../utils/getRandomFromList';
import { generateRandomId } from '../generateRandomId';
import { generateCategories } from './categories';
import { generatePaymentMethods } from './payment-methods';

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
