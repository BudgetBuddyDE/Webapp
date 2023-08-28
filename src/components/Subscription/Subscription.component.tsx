import { format } from 'date-fns';
import React from 'react';
import { determineNextExecutionDate } from '@/util/determineNextExecution.util';
import { EventRepeatRounded as EventRepeatRoundedIcon } from '@mui/icons-material';
import { Transaction, type TransactionProps } from '../Transaction/Transaction.component';

export type SubscriptionProps = Omit<TransactionProps, 'date'> & {
  executeAt: number;
};

export const Subscription: React.FC<SubscriptionProps> = ({
  icon = <EventRepeatRoundedIcon />,
  title,
  subtitle,
  executeAt,
  category,
  amount,
}) => {
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
