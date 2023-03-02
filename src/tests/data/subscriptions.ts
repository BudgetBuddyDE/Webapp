import { faker } from '@faker-js/faker';
import { Category, Subscription } from '../../models';
import type { uuid } from '../../types';
import { getFirstDayOfMonth, getRandomFromList } from '../../utils';
import { generateRandomId } from '../generateRandomId';
import { generateCategories } from './categories';
import { Categories, PaymentMethods } from './index';
import { generatePaymentMethods } from './payment-methods';

export function generateSubscriptions(
  amount = 10,
  date = new Date(),
  categories = generateCategories(),
  paymentMethods = generatePaymentMethods()
): Subscription[] {
  return Array.from({ length: amount }).map((_, index) => {
    return new Subscription({
      id: generateRandomId(),
      execute_at: date.getDate(),
      amount: Number(faker.finance.amount(-100, 100)),
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

export function generateSubscriptionList(
  categories = generateCategories(),
  paymentMethods = generatePaymentMethods()
): Subscription[] {
  const FUTURE_TRANSACTIONS = generateSubscriptions(5, faker.date.soon(5), categories, paymentMethods);
  const TODAYS_TRANSACTIONS = generateSubscriptions(3, new Date(), categories, paymentMethods);
  const PAST_TRANSACTIONS = generateSubscriptions(4, getFirstDayOfMonth(), categories, paymentMethods);

  return [...FUTURE_TRANSACTIONS, ...TODAYS_TRANSACTIONS, ...PAST_TRANSACTIONS].sort(
    (a, b) => a.execute_at - b.execute_at
  );
}

export const Subscriptions: Subscription[] = [
  new Subscription({
    id: 1,
    categories: Categories[0].categoryView,
    paymentMethods: PaymentMethods[0].paymentMethodView,
    receiver: 'Landlord',
    description: null,
    amount: -1000,
    execute_at: 2,
    created_by: 'unit-test',
    inserted_at: '01-01-2022',
    updated_at: '01-01-2022',
  }),
  new Subscription({
    id: 2,
    categories: Categories[2].categoryView,
    paymentMethods: PaymentMethods[0].paymentMethodView,
    receiver: 'Car insurance',
    description: null,
    amount: -140,
    execute_at: 2,
    created_by: 'unit-test',
    inserted_at: '01-01-2022',
    updated_at: '01-01-2022',
  }),
  new Subscription({
    id: 3,
    categories: Categories[4].categoryView,
    paymentMethods: PaymentMethods[0].paymentMethodView,
    receiver: 'Netflix',
    description: null,
    amount: -5,
    execute_at: 2,
    created_by: 'unit-test',
    inserted_at: '01-01-2022',
    updated_at: '01-01-2022',
  }),
  new Subscription({
    id: 4,
    categories: Categories[4].categoryView,
    paymentMethods: PaymentMethods[0].paymentMethodView,
    receiver: 'Disney+',
    description: null,
    amount: -8,
    execute_at: 2,
    created_by: 'unit-test',
    inserted_at: '01-01-2022',
    updated_at: '01-01-2022',
  }),
  new Subscription({
    id: 5,
    categories: Categories[4].categoryView,
    paymentMethods: PaymentMethods[0].paymentMethodView,
    receiver: 'Amazon Prime',
    description: null,
    amount: -9,
    execute_at: 3,
    created_by: 'unit-test',
    inserted_at: '01-01-2022',
    updated_at: '01-01-2022',
  }),
  new Subscription({
    id: 6,
    categories: Categories[4].categoryView,
    paymentMethods: PaymentMethods[0].paymentMethodView,
    receiver: 'Me',
    description: "It's my salary",
    amount: 2900,
    execute_at: 26,
    created_by: 'unit-test',
    inserted_at: '01-01-2022',
    updated_at: '01-01-2022',
  }),
];
