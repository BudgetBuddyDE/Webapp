import { PaymentMethod } from '../../models';

export const PaymentMethods: PaymentMethod[] = [
  new PaymentMethod({
    id: 1,
    name: 'Debit Card',
    provider: 'Visa',
    address: 'DE33500105179228347674',
    description: null,
    created_by: 'unit-test',
    updated_at: '01-01-2022',
    inserted_at: '01-01-2022',
  }),
  new PaymentMethod({
    id: 2,
    name: 'PayPal (unit@test.com)',
    provider: 'PayPal',
    address: 'unit@test.com',
    description: null,
    created_by: 'unit-test',
    updated_at: '01-01-2022',
    inserted_at: '01-01-2022',
  }),
];
