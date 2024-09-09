import {Box, type SxProps, TextField, type TextFieldProps, type Theme} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';

import {useScreenSize} from '@/hooks';

export const DATE_RANGE_INPUT_FORMAT = 'dd.MM.yyyy';

export type TDateRangeInputProps = TextFieldProps & {sx?: SxProps<Theme>};

export const StartDateInput: React.FC<TDateRangeInputProps> = props => {
  // 1rem is the default gap defined for the container
  return <TextField {...props} sx={{width: 'calc(50% - 0.5rem)', ...props.sx}} />;
};

export const EndDateInput: React.FC<TDateRangeInputProps> = props => {
  // 1rem is the default gap defined for the container
  return <TextField {...props} sx={{width: 'calc(50% - 0.5rem)', ...props.sx}} />;
};

export type TDateRange = {
  startDate: Date;
  endDate: Date;
};

export type TDateRangeProps = {
  onDateChange: (range: TDateRange) => void;
  dateFormat?: string;
  defaultStartDate?: Date;
  defaultEndDate?: Date;
  startDateLabel?: string;
  endDateLabel?: string;
  startDateSx?: SxProps<Theme>;
  endDateSx?: SxProps<Theme>;
  containerSx?: SxProps<Theme>;
  inputSize?: 'small' | 'medium';
};

export const DateRange: React.FC<TDateRangeProps> = ({
  onDateChange,
  dateFormat = 'dd.MM.yyyy',
  defaultStartDate = new Date(),
  defaultEndDate = new Date(),
  startDateLabel = 'From',
  endDateLabel = 'To',
  containerSx,
}) => {
  const screenSize = useScreenSize();
  const [startDate, setStartDate] = React.useState(defaultStartDate);
  const [endDate, setEndDate] = React.useState(defaultEndDate);

  const handler = {
    onStartDateChange: (date: Date | null) => {
      const d = date ?? new Date();
      setStartDate(d);
      onDateChange({startDate: d, endDate: endDate});
    },
    onEndDateChange: (date: Date | null) => {
      const d = date ?? new Date();
      setEndDate(d);
      onDateChange({startDate: startDate, endDate: d});
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '1rem',
          ...containerSx,
        }}>
        {screenSize === 'small' ? (
          <MobileDatePicker
            label={startDateLabel}
            format={dateFormat}
            value={startDate}
            onChange={handler.onStartDateChange}
            // renderInput={params => <StartDateInput sx={startDateSx} size={inputSize} {...params} />}
          />
        ) : (
          <DesktopDatePicker
            label={startDateLabel}
            format={dateFormat}
            value={startDate}
            onChange={handler.onStartDateChange}
            // renderInput={params => <StartDateInput sx={endDateSx} size={inputSize} {...params} />}
          />
        )}

        {screenSize === 'small' ? (
          <MobileDatePicker
            label={endDateLabel}
            format={dateFormat}
            value={endDate}
            onChange={handler.onEndDateChange}
            // renderInput={params => <EndDateInput sx={startDateSx} size={inputSize} {...params} />}
          />
        ) : (
          <DesktopDatePicker
            label={endDateLabel}
            format={dateFormat}
            value={endDate}
            onChange={handler.onEndDateChange}
            // renderInput={params => <EndDateInput sx={endDateSx} size={inputSize} {...params} />}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
};
