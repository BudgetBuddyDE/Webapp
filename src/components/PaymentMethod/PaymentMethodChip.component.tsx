import React from 'react';
import { StoreContext } from '@/context/Store.context';
import type { PaymentMethodView } from '@/type/payment-method.type';
import { Chip, type ChipProps } from '@mui/material';

export type PaymentMethodChipProps = ChipProps & { paymentMethod: PaymentMethodView };

export const PaymentMethodChip: React.FC<PaymentMethodChipProps> = (props) => {
    const { paymentMethod } = props;
    const { filter, setFilter } = React.useContext(StoreContext);
    return (
        <Chip
            onClick={() => {
                if (filter.paymentMethods !== null || filter.paymentMethods === null) {
                    setFilter((prev) => ({ ...prev, paymentMethods: [paymentMethod.id] }));
                }

                if (filter.paymentMethods?.includes(paymentMethod.id)) {
                    setFilter((prev) => ({ ...prev, paymentMethods: [paymentMethod.id] }));
                }
            }}
            onDelete={
                filter.paymentMethods !== null
                    ? () => {
                          if (filter.paymentMethods === null) return;
                          if (filter.paymentMethods.includes(paymentMethod.id)) {
                              setFilter((prev) => {
                                  const filteredList =
                                      prev.paymentMethods?.filter((id) => id !== paymentMethod.id) ?? [];
                                  return {
                                      ...prev,
                                      paymentMethods:
                                          prev.paymentMethods && filteredList.length > 0 ? filteredList : null,
                                  };
                              });
                          }
                      }
                    : undefined
            }
            label={props.paymentMethod.name}
            variant="outlined"
            {...props}
        />
    );
};
