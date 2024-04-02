import React from 'react';
import {Delete as DeleteIcon, Edit as EditIcon, Label as LabelIcon} from '@mui/icons-material';
import {Box, IconButton, Tooltip, Typography} from '@mui/material';
import {Icon} from '@/components/Icon.component';
import {ActionPaper} from '@/components/Base';
import {formatBalance} from '@/utils';
import {type TBudget} from '@budgetbuddyde/types';

export type TCategoryBudgetProps = {
  budget: TBudget;
  icon?: JSX.Element;
  onEdit?: (budget: TBudget) => void;
  onDelete?: (budget: TBudget) => void;
};

export const CategoryBudget: React.FC<TCategoryBudgetProps> = ({budget, icon = <LabelIcon />, onEdit, onDelete}) => {
  const handler = {
    onEdit() {
      if (onEdit) onEdit(budget);
    },
    onDelete() {
      if (onDelete) onDelete(budget);
    },
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            mr: 2,
          }}>
          <Icon icon={icon} sx={{mr: 1}} />
          <Box sx={{mr: 1}}>
            <Typography variant="subtitle1" fontWeight="bold">
              {budget.expand.category.name}
            </Typography>
            <Typography variant="subtitle2">{budget.expand.category.description || 'No description'}</Typography>
          </Box>
          <Box
            sx={{
              ml: 'auto',
              display: 'flex',
              flexDirection: {xs: 'column', md: 'row'},
              alignItems: 'baseline',
              columnGap: 0.5,
            }}>
            <Typography fontWeight="bold">{formatBalance(budget.budget)}</Typography>
          </Box>
        </Box>

        <ActionPaper>
          <Tooltip title="Edit">
            <IconButton onClick={handler.onEdit}>
              <EditIcon color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={handler.onDelete}>
              <DeleteIcon color="primary" />
            </IconButton>
          </Tooltip>
        </ActionPaper>
      </Box>
    </Box>
  );
};
