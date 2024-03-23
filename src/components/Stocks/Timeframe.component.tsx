import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { type TTimeframe } from './types';

export type TTimeframeProps = {
  onChange: (timeframe: TTimeframe) => void;
  defaultValue?: TTimeframe;
};

export const Timeframe: React.FC<TTimeframeProps> = ({ defaultValue, onChange }) => {
  const [timeframe, setTimeframe] = React.useState<TTimeframe>(defaultValue || '1m');
  return (
    <ToggleButtonGroup
      size="small"
      color="primary"
      value={timeframe}
      onChange={(event: React.BaseSyntheticEvent) => {
        const value = event.target.value as TTimeframe;
        if (value === timeframe) return;
        setTimeframe(value);
        onChange(value);
      }}
      exclusive
    >
      {['1W', '1M', '3M', '1Y', '5Y', 'YTD'].map((timeframe) => (
        <ToggleButton key={timeframe} value={timeframe.toLowerCase()}>
          {timeframe}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
