import { Icon } from '@/components/Icon.component';
import { formatBalance } from '@/utils';
import { Box, Chip, Typography } from '@mui/material';
import React from 'react';

export type TListWithIconProps = {
  icon?: JSX.Element;
  title: string;
  subtitle: string | string[] | JSX.Element;
  amount?: string | number;
};

export const ListWithIcon: React.FC<TListWithIconProps> = ({ icon, title, subtitle, amount }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        mt: 1,
      }}
    >
      <Icon icon={icon} sx={{ mr: 1 }} />
      <Box>
        <Typography fontWeight="bold">{title}</Typography>
        {typeof subtitle === 'string' && <Typography>{subtitle}</Typography>}
        {Array.isArray(subtitle) &&
          typeof subtitle[0] === 'string' &&
          subtitle.map((label) => (
            <Chip
              key={label.toLowerCase().replace(' ', '_')}
              label={label}
              sx={{ mr: 1 }}
              variant="outlined"
              size="small"
            />
          ))}
        {typeof subtitle === 'object' && subtitle}
      </Box>
      {amount && (
        <Box sx={{ ml: 'auto' }}>
          <Typography fontWeight="bold">
            {typeof amount === 'string' ? amount : formatBalance(amount)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
