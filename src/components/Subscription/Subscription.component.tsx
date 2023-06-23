import { format } from 'date-fns';
import React from 'react';
import { Transaction, TransactionProps } from '@/components/Transaction';
import { determineNextExecutionDate } from '@/utils';

export type SubscriptionProps = Omit<TransactionProps, 'date'> & {
    executeAt: number;
};

export const Subscription: React.FC<SubscriptionProps> = ({ icon, title, subtitle, executeAt, category, amount }) => {
    const nextExecutionDate = determineNextExecutionDate(executeAt);
    const formattedExecutionDate = `Next ${format(nextExecutionDate, 'dd.MM')}`;
    return (
        <Transaction
            icon={icon}
            title={title}
            subtitle={
                subtitle
                    ? typeof subtitle === 'string'
                        ? [formattedExecutionDate, subtitle]
                        : [formattedExecutionDate, ...subtitle]
                    : formattedExecutionDate
            }
            category={category}
            type="subscription"
            amount={amount}
        />
    );
};
