import { BaseTransaction } from '@/models/BaseTransaction.model';
import { SubscriptionService } from '@/services/Subscription.service';
import { TransactionService } from '@/services/Transaction.service';
import { faker } from '@faker-js/faker';
import { BaseSubscriptions, BaseTransactions } from './data';

// Test suites shown in this file are there to check the data shown in the dashboard for accuracy

describe('Validate earnings', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    test('Earnings @ 01.08', () => {
        jest.setSystemTime(new Date(2023, 7, 1));
        expect(new Date().getDate()).toBe(1);
        const result = TransactionService.calculateReceivedEarnings(BaseTransactions);
        expect(result).toBe(0);
    });

    test('Earnings @ 15.08', () => {
        jest.setSystemTime(new Date(2023, 7, 15));
        expect(new Date().getDate()).toBe(15);
        const result = TransactionService.calculateReceivedEarnings(BaseTransactions);
        expect(result).toBe(587.52);
    });

    test('Earnings @ 26.08', () => {
        jest.setSystemTime(new Date(2023, 7, 26));
        const result = TransactionService.calculateReceivedEarnings(BaseTransactions);
        expect(result).toBe(1662.52);
    });

    test('Earnings @ 31.08', () => {
        jest.setSystemTime(new Date(2023, 7, 31));
        const result = TransactionService.calculateReceivedEarnings(BaseTransactions);
        expect(result).toBe(1662.52);
    });
});

describe('Validate upcoming earnings', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    test('Upcoming earnings @ 01.08', () => {
        jest.setSystemTime(new Date(2023, 7, 1));
        expect(new Date().getDate()).toBe(1);
        const result = TransactionService.calculateUpcomingEarnings(BaseTransactions);
        expect(result).toBe(1662.52);
    });

    test('Upcoming earnings @ 15.08', () => {
        jest.setSystemTime(new Date(2023, 7, 15));
        expect(new Date().getDate()).toBe(15);
        const result = TransactionService.calculateUpcomingEarnings(BaseTransactions);
        expect(result).toBe(1075);
    });

    test('Upcoming earnings @ 26.08', () => {
        jest.setSystemTime(new Date(2023, 7, 26));
        const result = TransactionService.calculateUpcomingEarnings(BaseTransactions);
        expect(result).toBe(0);
    });

    test('Upcoming earnings @ 31.08', () => {
        jest.setSystemTime(new Date(2023, 7, 31));
        const result = TransactionService.calculateUpcomingEarnings(BaseTransactions);
        expect(result).toBe(0);
    });
});

// When SubscriptionService.calculateUpcomingExpenses() is used in the application transactions will be provided
describe('Validate paid expenses', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    test('Upcoming expenses @ 01.08', () => {
        jest.setSystemTime(new Date(2023, 7, 1));
        const result = SubscriptionService.calculateUpcomingExpenses(BaseSubscriptions);
        expect(result).toBe(432.14);
    });

    test('Upcoming expenses @ 15.08', () => {
        jest.setSystemTime(new Date(2023, 7, 15));
        const result = SubscriptionService.calculateUpcomingExpenses(BaseSubscriptions);
        expect(result).toBe(275.24);
    });

    test('Upcoming expenses @ 26.08', () => {
        jest.setSystemTime(new Date(2023, 7, 26));
        const result = SubscriptionService.calculateUpcomingExpenses(BaseSubscriptions);
        expect(result).toBe(9.65);
    });

    test('Upcoming expenses @ 31.08', () => {
        jest.setSystemTime(new Date(2023, 7, 31));
        const result = SubscriptionService.calculateUpcomingExpenses(BaseSubscriptions);
        expect(result).toBe(0);
    });
});

describe('Validate upcoming earnings', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    test('Upcoming earnings @ 01.08', () => {
        jest.setSystemTime(new Date(2023, 7, 1));
        const result = SubscriptionService.calculateUpcomingEarnings(BaseSubscriptions);
        expect(result).toBe(1325);
    });

    test('Upcoming earnings @ 15.08', () => {
        jest.setSystemTime(new Date(2023, 7, 15));
        const result = SubscriptionService.calculateUpcomingEarnings(BaseSubscriptions);
        expect(result).toBe(1075);
    });

    test('Upcoming earnings @ 26.08 w/ planned transaction', () => {
        jest.setSystemTime(new Date(2023, 7, 26));
        const result = SubscriptionService.calculateUpcomingEarnings(BaseSubscriptions, [
            new BaseTransaction({
                id: 1854,
                category: 27,
                paymentMethod: 105,
                receiver: faker.person.firstName(),
                description: null,
                amount: 500,
                date: '2023-08-27',
                created_by: faker.string.uuid(),
                inserted_at: '2023-08-26 17:34:43.672133+02',
                updated_at: '2023-08-26 17:34:43.672133+02',
            }),
        ]);
        expect(result).toBe(500);
    });

    test('Upcoming earnings @ 26.08', () => {
        jest.setSystemTime(new Date(2023, 7, 26));
        const result = SubscriptionService.calculateUpcomingEarnings(BaseSubscriptions);
        expect(result).toBe(0);
    });

    test('Upcoming earnings @ 31.08', () => {
        jest.setSystemTime(new Date(2023, 7, 31));
        const result = SubscriptionService.calculateUpcomingEarnings(BaseSubscriptions);
        expect(result).toBe(0);
    });
});
