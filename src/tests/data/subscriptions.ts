import { faker } from '@faker-js/faker';
import { Subscription } from '../../models/subscription.model';
import { uuid } from '../../types/profile.type';
import { getFirstDayOfMonth } from '../../utils/getFirstDayOfMonth';
import { getRandomFromList } from '../../utils/getRandomFromList';
import { generateRandomId } from '../generateRandomId';
import { generateCategories } from './categories';
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
  const FUTURE_TRANSACTIONS = generateSubscriptions(
    5,
    faker.date.soon(5),
    categories,
    paymentMethods
  );
  const TODAYS_TRANSACTIONS = generateSubscriptions(3, new Date(), categories, paymentMethods);
  const PAST_TRANSACTIONS = generateSubscriptions(
    4,
    getFirstDayOfMonth(),
    categories,
    paymentMethods
  );

  return [...FUTURE_TRANSACTIONS, ...TODAYS_TRANSACTIONS, ...PAST_TRANSACTIONS].sort(
    (a, b) => a.execute_at - b.execute_at
  );
}
