import { Box, Chip, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';
import { StoreContext } from '../../context';
import { useFetchCategories, useFetchPaymentMethods } from '../../hooks';

export interface INoResultsProps {
    sx?: SxProps<Theme>;
    text?: string;
    withFilters?: boolean;
}

export const NoResults: React.FC<INoResultsProps> = ({ sx, text = 'No items found', withFilters = false }) => {
    const { filter, setFilter } = React.useContext(StoreContext);
    const fetchCategories = useFetchCategories();
    const fetchPaymentMethods = useFetchPaymentMethods();
    return (
        <Box
            sx={{
                p: 1.5,
                backgroundColor: (theme) => theme.palette.action.disabledBackground,
                borderRadius: (theme) => `${theme.shape.borderRadius}px`,
                ...sx,
            }}
        >
            <Typography textAlign="center">{text}</Typography>
            {withFilters ? (
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <Typography textAlign="center">Applied filters: </Typography>
                    {filter.categories
                        ? filter.categories.map((categoryId) => {
                              const matchedCategory = fetchCategories.categories.find(({ id }) => id === categoryId);
                              if (!matchedCategory) return null;
                              return (
                                  <Chip
                                      key={matchedCategory.id}
                                      label={matchedCategory.name}
                                      onDelete={() => {
                                          setFilter((prev) => {
                                              const categories = prev.categories;
                                              const filteredCategories = (categories as number[]).filter(
                                                  (id) => id !== matchedCategory.id
                                              );
                                              return {
                                                  ...prev,
                                                  categories:
                                                      filteredCategories.length === 0 ? null : filteredCategories,
                                              };
                                          });
                                      }}
                                      size="small"
                                      // In order to make chpis deletable we need to cancel the mouse-down event
                                      onMouseDown={(event) => event.stopPropagation()}
                                      sx={{ ml: 0.5 }}
                                  />
                              );
                          })
                        : null}
                    {filter.paymentMethods
                        ? filter.paymentMethods.map((paymentMethodId) => {
                              const matchedPaymentMethod = fetchPaymentMethods.paymentMethods.find(
                                  ({ id }) => id === paymentMethodId
                              );
                              if (!matchedPaymentMethod) return null;
                              return (
                                  <Chip
                                      key={matchedPaymentMethod.id}
                                      label={matchedPaymentMethod.name}
                                      onDelete={() => {
                                          setFilter((prev) => {
                                              const paymentMethods = prev.paymentMethods;
                                              const filteredPaymentMethods = (paymentMethods as number[]).filter(
                                                  (id) => id !== matchedPaymentMethod.id
                                              );
                                              return {
                                                  ...prev,
                                                  paymentMethods:
                                                      filteredPaymentMethods.length === 0
                                                          ? null
                                                          : filteredPaymentMethods,
                                              };
                                          });
                                      }}
                                      size="small"
                                      // In order to make chpis deletable we need to cancel the mouse-down event
                                      onMouseDown={(event) => event.stopPropagation()}
                                      sx={{ ml: 0.5 }}
                                  />
                              );
                          })
                        : null}
                </Box>
            ) : null}
        </Box>
    );
};
