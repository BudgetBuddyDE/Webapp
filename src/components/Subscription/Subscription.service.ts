import {determineNextExecutionDate} from '@/utils';
import {type TCreateTransactionPayload, type TSubscription} from '@budgetbuddyde/types';

export class SubscriptionService {
  static getCreateTransactionPayload({
    owner,
    category,
    payment_method,
    transfer_amount,
    execute_at,
    information,
    receiver,
  }: TSubscription): TCreateTransactionPayload {
    return {
      owner,
      category,
      payment_method,
      transfer_amount,
      information,
      receiver,
      processed_at: determineNextExecutionDate(execute_at),
    };
  }

  static sortByExecutionDate(subscriptions: TSubscription[]): TSubscription[] {
    const today = new Date().getDate();
    return subscriptions.sort((a, b) => {
      if (a.execute_at <= today && b.execute_at > today) {
        return 1; // Move already paid subscriptions to the end
      } else if (a.execute_at > today && b.execute_at <= today) {
        return -1; // Keep unpaid subscriptions at the beginning
      } else {
        return a.execute_at - b.execute_at; // Sort by executeAt for the rest
      }
    });
  }

  static getPlannedBalanceByType(
    subscriptions: TSubscription[],
    type: 'INCOME' | 'SPENDINGS' = 'INCOME',
  ): TSubscription[] {
    return this.sortByExecutionDate(
      subscriptions.filter(({transfer_amount}) => (type === 'INCOME' ? transfer_amount > 0 : transfer_amount < 0)),
    );
  }
}
