import { Chip, ChipProps } from '@mui/material';
import React from 'react';
import { StoreContext } from '../context/';
import type { ICategoryView, IPaymentMethodView } from '../types/';

export type CategoryChipProps = { category: ICategoryView } & ChipProps;
export type PaymentMethodChipProps = { paymentMethod: IPaymentMethodView } & ChipProps;

export const CategoryChip: React.FC<CategoryChipProps> = (props) => {
    const { category } = props;
    const { filter, setFilter } = React.useContext(StoreContext);
    return (
        <Chip
            onClick={() => {
                if (filter.categories !== null || filter.categories === null) {
                    setFilter((prev) => ({ ...prev, categories: [category.id] }));
                }

                if (filter.categories?.includes(category.id)) {
                    setFilter((prev) => ({ ...prev, categories: [category.id] }));
                }
            }}
            onDelete={
                filter.categories !== null
                    ? () => {
                          if (filter.categories === null) return;
                          if (filter.categories.includes(category.id)) {
                              setFilter((prev) => {
                                  const filteredList = prev.categories?.filter((id) => id !== category.id) ?? [];
                                  return {
                                      ...prev,
                                      categories: prev.categories && filteredList.length > 0 ? filteredList : null,
                                  };
                              });
                          }
                      }
                    : undefined
            }
            label={props.category.name}
            variant="outlined"
            {...props}
        />
    );
};

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
