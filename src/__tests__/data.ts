import type { TTransaction, TUser } from '@/types';
import { faker } from '@faker-js/faker';

const TransactionOwner: TUser = {
  uuid: faker.string.uuid(),
  email: 'user1@example.com',
  name: 'John',
  surname: 'Doe',
  password: 'password1',
  createdAt: new Date('2023-01-01'),
};

export const MockedTransactions: TTransaction[] = [
  {
    id: 1,
    owner: TransactionOwner,
    category: {
      id: 1,
      owner: TransactionOwner,
      name: 'Category1',
      description: 'Category description 1',
      createdAt: new Date('2023-01-01'),
    },
    paymentMethod: {
      id: 1,
      owner: TransactionOwner,
      name: 'PaymentMethod1',
      address: 'PaymentMethod address 1',
      description: 'PaymentMethod description 1',
      createdAt: new Date('2023-01-01'),
    },
    processedAt: new Date('2023-01-15'),
    receiver: 'Receiver1',
    description: 'Transaction description 1',
    transferAmount: 100.0,
    createdAt: new Date('2023-01-10'),
  },
  {
    id: 2,
    owner: TransactionOwner,
    category: {
      id: 2,
      owner: TransactionOwner,
      name: 'Category2',
      description: 'Category description 2',
      createdAt: new Date('2023-02-01'),
    },
    paymentMethod: {
      id: 2,
      owner: TransactionOwner,
      name: 'PaymentMethod2',
      address: 'PaymentMethod address 2',
      description: 'PaymentMethod description 2',
      createdAt: new Date('2023-02-01'),
    },
    processedAt: new Date('2023-01-15'),
    receiver: 'Receiver2',
    description: 'Transaction description 2',
    transferAmount: 150.0,
    createdAt: new Date('2023-02-10'),
  },
  {
    id: 3,
    owner: TransactionOwner,
    category: {
      id: 1,
      owner: TransactionOwner,
      name: 'Category1',
      description: 'Category description 1',
      createdAt: new Date('2023-01-01'),
    },
    paymentMethod: {
      id: 1,
      owner: TransactionOwner,
      name: 'PaymentMethod1',
      address: 'PaymentMethod address 1',
      description: 'PaymentMethod description 1',
      createdAt: new Date('2023-01-01'),
    },
    processedAt: new Date('2023-01-12'),
    receiver: 'Receiver3',
    description: 'Transaction description 3',
    transferAmount: 200.0,
    createdAt: new Date('2023-03-10'),
  },
  {
    id: 4,
    owner: TransactionOwner,
    category: {
      id: 2,
      owner: TransactionOwner,
      name: 'Category2',
      description: 'Category description 2',
      createdAt: new Date('2023-02-01'),
    },
    paymentMethod: {
      id: 2,
      owner: TransactionOwner,
      name: 'PaymentMethod2',
      address: 'PaymentMethod address 2',
      description: 'PaymentMethod description 2',
      createdAt: new Date('2023-02-01'),
    },
    processedAt: new Date('2023-01-1'),
    receiver: 'Receiver4',
    description: 'Transaction description 4',
    transferAmount: 120.0,
    createdAt: new Date('2023-04-10'),
  },
  {
    id: 5,
    owner: TransactionOwner,
    category: {
      id: 1,
      owner: TransactionOwner,
      name: 'Category1',
      description: 'Category description 1',
      createdAt: new Date('2023-01-01'),
    },
    paymentMethod: {
      id: 1,
      owner: TransactionOwner,
      name: 'PaymentMethod1',
      address: 'PaymentMethod address 1',
      description: 'PaymentMethod description 1',
      createdAt: new Date('2023-01-01'),
    },
    processedAt: new Date('2023-01-15'),
    receiver: 'Receiver5',
    description: 'Transaction description 5',
    transferAmount: 80.0,
    createdAt: new Date('2023-05-10'),
  },
  {
    id: 6,
    owner: TransactionOwner,
    category: {
      id: 2,
      owner: TransactionOwner,
      name: 'Category2',
      description: 'Category description 2',
      createdAt: new Date('2023-02-01'),
    },
    paymentMethod: {
      id: 2,
      owner: TransactionOwner,
      name: 'PaymentMethod2',
      address: 'PaymentMethod address 2',
      description: 'PaymentMethod description 2',
      createdAt: new Date('2023-02-01'),
    },
    processedAt: new Date('2023-06-15'),
    receiver: 'Receiver6',
    description: 'Transaction description 6',
    transferAmount: 200.0,
    createdAt: new Date('2023-06-10'),
  },
  {
    id: 7,
    owner: TransactionOwner,
    category: {
      id: 1,
      owner: TransactionOwner,
      name: 'Category1',
      description: 'Category description 1',
      createdAt: new Date('2023-01-01'),
    },
    paymentMethod: {
      id: 1,
      owner: TransactionOwner,
      name: 'PaymentMethod1',
      address: 'PaymentMethod address 1',
      description: 'PaymentMethod description 1',
      createdAt: new Date('2023-01-01'),
    },
    processedAt: new Date('2023-07-15'),
    receiver: 'Receiver7',
    description: 'Transaction description 7',
    transferAmount: 90.0,
    createdAt: new Date('2023-07-10'),
  },
  {
    id: 8,
    owner: TransactionOwner,
    category: {
      id: 2,
      owner: TransactionOwner,
      name: 'Category2',
      description: 'Category description 2',
      createdAt: new Date('2023-02-01'),
    },
    paymentMethod: {
      id: 2,
      owner: TransactionOwner,
      name: 'PaymentMethod2',
      address: 'PaymentMethod address 2',
      description: 'PaymentMethod description 2',
      createdAt: new Date('2023-02-01'),
    },
    processedAt: new Date('2023-08-15'),
    receiver: 'Receiver8',
    description: 'Transaction description 8',
    transferAmount: 120.0,
    createdAt: new Date('2023-08-10'),
  },
  {
    id: 9,
    owner: TransactionOwner,
    category: {
      id: 1,
      owner: TransactionOwner,
      name: 'Category1',
      description: 'Category description 1',
      createdAt: new Date('2023-01-01'),
    },
    paymentMethod: {
      id: 1,
      owner: TransactionOwner,
      name: 'PaymentMethod1',
      address: 'PaymentMethod address 1',
      description: 'PaymentMethod description 1',
      createdAt: new Date('2023-01-01'),
    },
    processedAt: new Date('2023-09-15'),
    receiver: 'Receiver9',
    description: 'Transaction description 9',
    transferAmount: 80.0,
    createdAt: new Date('2023-09-10'),
  },
  {
    id: 10,
    owner: TransactionOwner,
    category: {
      id: 2,
      owner: TransactionOwner,
      name: 'Category2',
      description: 'Category description 2',
      createdAt: new Date('2023-02-01'),
    },
    paymentMethod: {
      id: 2,
      owner: TransactionOwner,
      name: 'PaymentMethod2',
      address: 'PaymentMethod address 2',
      description: 'PaymentMethod description 2',
      createdAt: new Date('2023-02-01'),
    },
    processedAt: new Date('2023-10-15'),
    receiver: 'Receiver10',
    description: 'Transaction description 10',
    transferAmount: 150.0,
    createdAt: new Date('2023-10-10'),
  },
  {
    id: 11,
    owner: TransactionOwner,
    category: {
      id: 1,
      owner: TransactionOwner,
      name: 'Category1',
      description: 'Category description 1',
      createdAt: new Date('2023-01-01'),
    },
    paymentMethod: {
      id: 1,
      owner: TransactionOwner,
      name: 'PaymentMethod1',
      address: 'PaymentMethod address 1',
      description: 'PaymentMethod description 1',
      createdAt: new Date('2023-01-01'),
    },
    processedAt: new Date('2023-11-15'),
    receiver: 'Receiver11',
    description: 'Transaction description 11',
    transferAmount: 100.0,
    createdAt: new Date('2023-11-10'),
  },
  {
    id: 12,
    owner: TransactionOwner,
    category: {
      id: 2,
      owner: TransactionOwner,
      name: 'Category2',
      description: 'Category description 2',
      createdAt: new Date('2023-02-01'),
    },
    paymentMethod: {
      id: 2,
      owner: TransactionOwner,
      name: 'PaymentMethod2',
      address: 'PaymentMethod address 2',
      description: 'PaymentMethod description 2',
      createdAt: new Date('2023-02-01'),
    },
    processedAt: new Date('2023-12-15'),
    receiver: 'Receiver12',
    description: 'Transaction description 12',
    transferAmount: 180.0,
    createdAt: new Date('2023-12-10'),
  },
  {
    id: 13,
    owner: TransactionOwner,
    category: {
      id: 1,
      owner: TransactionOwner,
      name: 'Category1',
      description: 'Category description 1',
      createdAt: new Date('2023-01-01'),
    },
    paymentMethod: {
      id: 1,
      owner: TransactionOwner,
      name: 'PaymentMethod1',
      address: 'PaymentMethod address 1',
      description: 'PaymentMethod description 1',
      createdAt: new Date('2023-01-01'),
    },
    processedAt: new Date('2024-01-15'),
    receiver: 'Receiver13',
    description: 'Transaction description 13',
    transferAmount: 130.0,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 14,
    owner: TransactionOwner,
    category: {
      id: 2,
      owner: TransactionOwner,
      name: 'Category2',
      description: 'Category description 2',
      createdAt: new Date('2023-02-01'),
    },
    paymentMethod: {
      id: 2,
      owner: TransactionOwner,
      name: 'PaymentMethod2',
      address: 'PaymentMethod address 2',
      description: 'PaymentMethod description 2',
      createdAt: new Date('2023-02-01'),
    },
    processedAt: new Date('2024-02-15'),
    receiver: 'Receiver14',
    description: 'Transaction description 14',
    transferAmount: 160.0,
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 15,
    owner: TransactionOwner,
    category: {
      id: 1,
      owner: TransactionOwner,
      name: 'Category1',
      description: 'Category description 1',
      createdAt: new Date('2023-01-01'),
    },
    paymentMethod: {
      id: 1,
      owner: TransactionOwner,
      name: 'PaymentMethod1',
      address: 'PaymentMethod address 1',
      description: 'PaymentMethod description 1',
      createdAt: new Date('2023-01-01'),
    },
    processedAt: new Date('2024-03-15'),
    receiver: 'Receiver15',
    description: 'Transaction description 15',
    transferAmount: 110.0,
    createdAt: new Date('2024-03-10'),
  },
];