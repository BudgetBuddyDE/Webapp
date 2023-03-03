import { Transaction } from '../../models';
import { Categories } from './categories';
import { PaymentMethods } from './payment-methods';

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
