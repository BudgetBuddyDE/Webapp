import {type TCategory} from '@budgetbuddyde/types';
import {Chip, type ChipProps, Tooltip} from '@mui/material';
import React from 'react';

import {useFilterStore} from '@/components/Filter';
import {useTransactionStore} from '@/components/Transaction';

export type TCategoryChipProps = ChipProps & {category: TCategory; showUsage?: boolean};

export const CategoryChip: React.FC<TCategoryChipProps> = ({category, showUsage = false, ...otherProps}) => {
  const {filters, setFilters} = useFilterStore();
  const {categoryUsage} = useTransactionStore();

  const handleChipClick = () => {
    if (!filters.categories) {
      setFilters({
        ...filters,
        categories: [category.id],
      });
      return;
    }
    setFilters({
      ...filters,
      categories: [...filters.categories, category.id],
    });
  };

  const handleChipDelete = () => {
    if (!filters.categories || !filters.categories.includes(category.id)) return;
    setFilters({
      ...filters,
      categories: filters.categories.filter(id => id !== category.id),
    });
  };

  if (showUsage) {
    return (
      <Tooltip
        title={`Used ${categoryUsage.has(category.id) ? categoryUsage.get(category.id) : 0} times`}
        placement="top"
        arrow>
        <Chip
          onClick={handleChipClick}
          onDelete={filters.categories && filters.categories.includes(category.id) ? handleChipDelete : undefined}
          label={category.name}
          variant="outlined"
          {...otherProps}
        />
      </Tooltip>
    );
  }
  return (
    <Chip
      onClick={handleChipClick}
      onDelete={filters.categories && filters.categories.includes(category.id) ? handleChipDelete : undefined}
      label={category.name}
      variant="outlined"
      {...otherProps}
    />
  );
};
