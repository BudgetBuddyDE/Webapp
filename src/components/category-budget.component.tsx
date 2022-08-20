import { FC } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import {
  Label as LabelIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

export interface ICategoryBudgetProps {
  title: string;
  subtitle: string;
  amount: number;
  budget: number;
  icon?: JSX.Element;
}

export const CategoryBudget: FC<ICategoryBudgetProps> = ({
  title,
  subtitle,
  amount,
  budget,
  icon = <LabelIcon />,
}) => {
  amount = Math.abs(amount);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        mt: '1rem',
      }}
    >
      <Box
        sx={{
          mr: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          aspectRatio: '1/1',
          height: '2.75rem',
          backgroundColor: (theme) => theme.palette.action.disabledBackground,
          borderRadius: (theme) => `${theme.shape.borderRadius}px`,
        }}
      >
        {icon}
      </Box>
      <Box
        sx={{
          mr: '0.5rem',
        }}
      >
        <Typography fontWeight="bold">{title}</Typography>
        <Typography>{subtitle || 'No description'}</Typography>
      </Box>
      <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'row' }}>
        <Tooltip
          title={budget > amount ? "You'r still in budget" : "You've spent a little too much"}
        >
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              mr: 1,
              fontWeight: 'bold',
              fontSize: '90%',
              color: (theme) =>
                budget >= amount ? theme.palette.success.main : theme.palette.error.main,
            }}
          >
            {amount.toLocaleString('de', { style: 'currency', currency: 'EUR' })}
          </Typography>
        </Tooltip>

        <Typography fontWeight="bold">
          {budget.toLocaleString('de', { style: 'currency', currency: 'EUR' })}
        </Typography>
      </Box>
    </Box>
  );
};
