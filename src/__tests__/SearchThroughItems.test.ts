import { Subscription } from '@/models/Subscription.model';
import { Transaction } from '@/models/Transaction.model';
import { type Filter } from '@/type/filter.type';
import { filterSubscriptions, filterTransactions } from '@/util/filter.util';

describe('Search through transactions', () => {
    const filter: Filter = {
        keyword: null,
        categories: null,
        paymentMethods: null,
        dateFrom: null,
        dateTo: null,
        priceFrom: null,
        priceTo: null,
    };
    const transactions = [
        new Transaction({
            id: 1,
            categories: { id: 1, name: 'Rent', description: '' },
            paymentMethods: {
                id: 1,
                name: 'Payment Method 1',
                address: 'Payment Method 1 address',
                provider: 'Payment Provider 1',
                description: 'Payment Method 1 description',
            },
            receiver: 'Landlord',
            description: 'Paid for App. 1',
            amount: 100,
            date: new Date('2023-06-01').toString(),
            created_by: 'user1',
            updated_at: new Date().toString(),
            inserted_at: new Date().toString(),
        }),
        new Transaction({
            id: 2,
            categories: { id: 2, name: 'Deposit', description: '' },
            paymentMethods: {
                id: 1,
                name: 'Payment Method 1',
                address: 'Payment Method 1 address',
                provider: 'Payment Provider 1',
                description: 'Payment Method 1 description',
            },
            receiver: 'Landlord',
            description: 'Security deposit for App. 1',
            amount: 100,
            date: new Date('2023-06-01').toString(),
            created_by: 'user1',
            updated_at: new Date().toString(),
            inserted_at: new Date().toString(),
        }),
    ];

    test('search by category', () => {
        expect(filterTransactions('rent', filter, transactions).length).toBeGreaterThanOrEqual(1);
        expect(filterTransactions('RENT', filter, transactions).length).toBeGreaterThanOrEqual(1);
        expect(filterTransactions('reNt', filter, transactions).length).toBeGreaterThanOrEqual(1);
    });

    test('search by receiver', () => {
        expect(filterTransactions('landlord', filter, transactions).length).toBeGreaterThanOrEqual(1);
        expect(filterTransactions('LANDLORD', filter, transactions).length).toBeGreaterThanOrEqual(1);
        expect(filterTransactions('landLoRd', filter, transactions).length).toBeGreaterThanOrEqual(1);
    });

    test('search by description', () => {
        expect(filterTransactions('deposit', filter, transactions).length).toBeGreaterThanOrEqual(1);
        expect(filterTransactions('security deposit', filter, transactions).length).toBeGreaterThanOrEqual(1);
    });
});

describe('Search through subscriptions', () => {
    const filter: Filter = {
        keyword: null,
        categories: null,
        paymentMethods: null,
        dateFrom: null,
        dateTo: null,
        priceFrom: null,
        priceTo: null,
    };
    const subscriptions: Subscription[] = [
        new Subscription({
            id: 1,
            paused: false,
            categories: { id: 1, name: 'Rent', description: '' },
            paymentMethods: {
                id: 1,
                name: 'Payment Method 1',
                address: 'Payment Method 1 address',
                provider: 'Payment Provider 1',
                description: 'Payment Method 1 description',
            },
            receiver: 'Landlord',
            description: 'Paid for App. 1',
            amount: 100,
            execute_at: 1,
            created_by: 'user1',
            updated_at: new Date().toString(),
            inserted_at: new Date().toString(),
        }),
        new Subscription({
            id: 2,
            paused: false,
            categories: { id: 2, name: 'Deposit', description: '' },
            paymentMethods: {
                id: 1,
                name: 'Payment Method 1',
                address: 'Payment Method 1 address',
                provider: 'Payment Provider 1',
                description: 'Payment Method 1 description',
            },
            receiver: 'Landlord',
            description: 'Security deposit for App. 1',
            amount: 100,
            execute_at: 1,
            created_by: 'user1',
            updated_at: new Date().toString(),
            inserted_at: new Date().toString(),
        }),
    ];

    test('search by category', () => {
        expect(filterSubscriptions('rent', filter, subscriptions).length).toBeGreaterThanOrEqual(1);
        expect(filterSubscriptions('RENT', filter, subscriptions).length).toBeGreaterThanOrEqual(1);
        expect(filterSubscriptions('reNt', filter, subscriptions).length).toBeGreaterThanOrEqual(1);
    });

    test('search by receiver', () => {
        expect(filterSubscriptions('landlord', filter, subscriptions).length).toBeGreaterThanOrEqual(1);
        expect(filterSubscriptions('LANDLORD', filter, subscriptions).length).toBeGreaterThanOrEqual(1);
        expect(filterSubscriptions('landLoRd', filter, subscriptions).length).toBeGreaterThanOrEqual(1);
    });

    test('search by description', () => {
        expect(filterSubscriptions('deposit', filter, subscriptions).length).toBeGreaterThanOrEqual(1);
        expect(filterSubscriptions('security deposit', filter, subscriptions).length).toBeGreaterThanOrEqual(1);
    });
});
