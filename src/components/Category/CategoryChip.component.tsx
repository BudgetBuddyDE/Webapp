import React from 'react';
import { StoreContext } from '@/context';
import type { ICategoryView } from '@/types';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

export type CategoryChipProps = ChipProps & { category: ICategoryView };

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
