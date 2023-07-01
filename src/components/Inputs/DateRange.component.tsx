import React from 'react';
import { useScreenSize } from '@/hook/useScreenSize.hook';
import { useStateCallback } from '@/hook/useStateCallback.hook';
import { Box, type SxProps, TextField, TextFieldProps, type Theme } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export type DateRangeInputProps = TextFieldProps & { sx?: SxProps<Theme> };

export const DateFromInput: React.FC<DateRangeInputProps> = (props) => {
    // 1rem is the default gap defined for the container
    return <TextField {...props} sx={{ width: 'calc(50% - 0.5rem)', ...props.sx }} />;
};

export const DateToInput: React.FC<DateRangeInputProps> = (props) => {
    // 1rem is the default gap defined for the container
    return <TextField {...props} sx={{ width: 'calc(50% - 0.5rem)', ...props.sx }} />;
};

export type TDateRange = {
    dateFrom: Date;
    dateTo: Date;
};

export type DateRaneProps = {
    onDateChange: (range: TDateRange) => void;
    dateFormat?: string;
    defaultDateFrom?: Date;
    defaultDateTo?: Date;
    dateFromLabel?: string;
    dateToLabel?: string;
    dateFromSx?: SxProps<Theme>;
    dateToSx?: SxProps<Theme>;
    containerSx?: SxProps<Theme>;
    inputSize?: 'small' | 'medium';
};

export const DateRange: React.FC<DateRaneProps> = ({
    onDateChange,
    dateFormat = 'dd.MM.yyyy',
    defaultDateFrom = new Date(),
    defaultDateTo = new Date(),
    dateFromLabel = 'From',
    dateToLabel = 'To',
    dateFromSx,
    dateToSx,
    containerSx,
    inputSize = 'medium',
}) => {
    const screenSize = useScreenSize();
    const [dateFrom, setDateFrom] = useStateCallback(defaultDateFrom);
    const [dateTo, setDateTo] = useStateCallback(defaultDateTo);

    const handler = {
        onFromChange: (date: Date | null) => {
            setDateFrom(date || new Date(), (date) => onDateChange({ dateFrom: date, dateTo: dateTo }));
        },
        onToChange: (date: Date | null) => {
            setDateTo(date || new Date(), (date) => onDateChange({ dateFrom: dateFrom, dateTo: date }));
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
                }}
            >
                {screenSize === 'small' ? (
                    <MobileDatePicker
                        label={dateFromLabel}
                        inputFormat={dateFormat}
                        value={dateFrom}
                        onChange={handler.onFromChange}
                        renderInput={(params) => <DateFromInput sx={dateFromSx} size={inputSize} {...params} />}
                    />
                ) : (
                    <DesktopDatePicker
                        label={dateFromLabel}
                        inputFormat={dateFormat}
                        value={dateFrom}
                        onChange={handler.onFromChange}
                        renderInput={(params) => <DateFromInput sx={dateFromSx} size={inputSize} {...params} />}
                    />
                )}

                {screenSize === 'small' ? (
                    <MobileDatePicker
                        label={dateToLabel}
                        inputFormat={dateFormat}
                        value={dateTo}
                        onChange={handler.onToChange}
                        renderInput={(params) => <DateToInput sx={dateToSx} size={inputSize} {...params} />}
                    />
                ) : (
                    <DesktopDatePicker
                        label={dateToLabel}
                        inputFormat={dateFormat}
                        value={dateTo}
                        onChange={handler.onToChange}
                        renderInput={(params) => <DateToInput sx={dateToSx} size={inputSize} {...params} />}
                    />
                )}
            </Box>
        </LocalizationProvider>
    );
};
