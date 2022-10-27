import { Subscription } from '../../models/subscription.model';
import { determineNextExecutionDate } from '../determineNextExecution';

export function sortSubscriptionsByExecution(subscriptions: Subscription[]) {
  return subscriptions.sort(function (a, b) {
    const today = new Date();
    // It does work fine for dates
    return (
      // @ts-ignore
      Math.abs(today - determineNextExecutionDate(a.execute_at)) -
      // @ts-ignore
      Math.abs(today - determineNextExecutionDate(b.execute_at))
    );
  });
}
