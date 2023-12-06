import { Card, NoResults, type TCardProps } from '@/components/Base';
import { Icon } from '@/components/Icon.component';
import { type TBudgetProgress } from '@/types';
import { formatBalance } from '@/utils';
import { AddRounded } from '@mui/icons-material';
import { Box, LinearProgress, Typography } from '@mui/material';
import React from 'react';

export type TBudgetProgressProps = TBudgetProgress;

export const BudgetProgress: React.FC<TBudgetProgressProps> = ({
  category,
  amount_spent,
  budget,
}) => {
  const progress: number = React.useMemo(() => {
    return (amount_spent * 100) / budget;
  }, [budget, amount_spent]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        mt: 1,
      }}
    >
      <Icon icon={<AddRounded />} sx={{ mr: 1 }} />
      <Box sx={{ flex: 1, mr: 1 }}>
        <Typography fontWeight="bold">{category.name}</Typography>
        <LinearProgress
          sx={{
            height: '.75rem',
            borderRadius: (theme) => Math.round(theme.shape.borderRadius / 3) + 'px',
          }}
          variant="determinate"
          color={amount_spent <= budget ? 'primary' : 'error'}
          value={progress}
        />
      </Box>

      <Box sx={{ ml: 'auto', width: '10%', textAlign: 'center' }}>
        <Typography fontWeight="bold">{formatBalance(amount_spent)}</Typography>
      </Box>
    </Box>
  );
};

export type TBudgetProgressWrapperProps = {
  data: TBudgetProgress[];
  cardProps?: TCardProps;
};

export const BudgetProgressWrapper: React.FC<TBudgetProgressWrapperProps> = ({
  data,
  cardProps,
}) => {
  return (
    <Card {...cardProps}>
      <Card.Header>
        <Box>
          <Card.Title>Progress</Card.Title>
          <Card.Subtitle>How much did u already spent</Card.Subtitle>
        </Box>
      </Card.Header>
      <Card.Body sx={{ mt: 1 }}>
        {data.length > 0 ? (
          data.map((entry) => <BudgetProgress key={entry.id} {...entry} />)
        ) : (
          <NoResults />
        )}
      </Card.Body>
    </Card>
  );
};
