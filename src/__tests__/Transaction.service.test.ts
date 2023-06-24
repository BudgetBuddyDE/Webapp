import { addDays } from 'date-fns';
import { Transaction } from '@/models/Transaction.model';
import { TransactionService } from '@/services/Transaction.service';

let unrelevantData = {
    receiver: '',
    description: null,
    categories: { id: 1, name: 'name', description: null },
    paymentMethods: { id: 1, name: 'name', provider: 'provider', address: 'address', description: null },
    updated_at: new Date().toString(),
    inserted_at: new Date().toString(),
    created_by: '',
};

const transactions = [
    new Transaction({ id: 1, amount: 100, date: new Date().toString(), ...unrelevantData }),
    new Transaction({ id: 2, amount: -100, date: new Date().toString(), ...unrelevantData }),
    new Transaction({ id: 3, amount: 100, date: new Date().toString(), ...unrelevantData }),
    new Transaction({ id: 4, amount: 100, date: new Date().toString(), ...unrelevantData }),
    new Transaction({ id: 5, amount: 100, date: addDays(new Date(), 1).toString(), ...unrelevantData }),
    new Transaction({ id: 6, amount: 750, date: addDays(new Date(), 1).toString(), ...unrelevantData }),
    new Transaction({ id: 7, amount: -50.75, date: addDays(new Date(), 1).toString(), ...unrelevantData }),
];

describe('TransactionService', () => {
    test('calculateReceivedEarnings', () => {
        expect(TransactionService.calculateReceivedEarnings(transactions)).toBe(300);
    });

    test('calculateUpcomingEarnings', () => {
        expect(TransactionService.calculateUpcomingEarnings(transactions)).toBe(850);
    });

    test('calculatePaidExpenses', () => {
        expect(TransactionService.calculatePaidExpenses(transactions)).toBe(100);
    });

    test('calculateUpcomingExpenses', () => {
        expect(TransactionService.calculateUpcomingExpenses(transactions)).toBe(50.75);
    });
});
