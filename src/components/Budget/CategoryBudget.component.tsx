import React from 'react';
import { Budget } from '@/models/Budget.model';
import { formatBalance } from '@/util/formatBalance.util';
import { Delete as DeleteIcon, Edit as EditIcon, Label as LabelIcon } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { ActionPaper } from '../Base/ActionPaper.component';
import { Icon } from '../Core/Icon.component';

export type CategoryBudgetProps = {
  budget: Budget;
  icon?: JSX.Element;
  onEdit?: (budget: CategoryBudgetProps['budget']) => void;
  onDelete?: (budget: ReturnType<Budget['delete']>) => void;
};

export const CategoryBudget: React.FC<CategoryBudgetProps> = ({ budget, icon = <LabelIcon />, onEdit, onDelete }) => {
  const handler = {
    onEdit: function () {
      if (onEdit) onEdit(budget);
    },
    onDelete: function () {
      if (onDelete) onDelete(budget.delete());
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
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            mr: 2,
          }}
        >
          <Icon icon={icon} sx={{ mr: 1 }} />
          <Box sx={{ mr: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {budget.category.name}
            </Typography>
            <Typography variant="subtitle2">{budget.category.description || 'No description'}</Typography>
          </Box>
          <Box
            sx={{
              ml: 'auto',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'baseline',
              columnGap: 0.5,
            }}
          >
            <Tooltip
              title={
                budget.budget > Math.abs(budget.currentlySpent)
                  ? "You'r still in budget"
                  : "You've spent a little too much"
              }
            >
              <Typography
                sx={{
                  ml: 'auto',
                  fontWeight: 'bold',
                  fontSize: '90%',
                  color: (theme) =>
                    budget.budget >= Math.abs(budget.currentlySpent)
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                }}
              >
                {formatBalance(Math.abs(budget.currentlySpent))}
              </Typography>
            </Tooltip>
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
