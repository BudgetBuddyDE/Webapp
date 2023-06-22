import React from 'react';
import { ActionPaper, Card } from '@/components/Base';
import { PieChart, PieChartData } from '@/components/Charts';
import { NoResults } from '@/components/Core';
import { Category, Transaction } from '@/models';
import { Alert, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ParentSize } from '@visx/responsive';

export interface EarningsByCategoryProps {
    categories: Category[];
    transactions: Transaction[];
}

export const EarningsByCategory: React.FC<EarningsByCategoryProps> = ({ categories, transactions }) => {
    const [chartContent, setChartContent] = React.useState<'INCOME' | 'SPENDINGS'>('INCOME');

    const incomeStats = React.useMemo(() => {
        if (categories.length < 1 || transactions.length < 1) return [];
        return categories.map(({ id, name }) => ({
            name: name,
            sum: transactions.reduce((prev, cur) => {
                return prev + (cur.categories.id === id && cur.amount > 0 ? cur.amount : 0);
            }, 0),
        }));
    }, [categories, transactions]);

    const spendingsStats = React.useMemo(() => {
        if (categories.length < 1 || transactions.length < 1) return [];
        return categories.map(({ id, name }) => ({
            name: name,
            sum: transactions.reduce((prev, cur) => {
                return prev + (cur.categories.id === id && cur.amount < 0 ? cur.amount : 0);
            }, 0),
        }));
    }, [categories]);

    const chartData: PieChartData[] = React.useMemo(() => {
        return (chartContent === 'INCOME' ? incomeStats : spendingsStats).map(({ name, sum }) => ({
            label: name,
            value: sum,
        }));
    }, [chartContent, incomeStats, spendingsStats]);

    const warnMsg: string = React.useMemo(() => {
        if (chartData.length > 0) return '';
        let missing: string[] = [];

        if (transactions.length < 1) missing.push('transactions');
        if (categories.length < 1) missing.push('categories');

        return 'You are missing out on ' + missing.join(', ') + '!';
    }, [chartData]);

    return (
        <Card>
            <Card.Header>
                <Box>
                    <Card.Title>Balance</Card.Title>
                    <Card.Subtitle>How much did u {chartContent === 'INCOME' ? 'earn' : 'spend'}?</Card.Subtitle>
                </Box>

                <Card.HeaderActions>
                    <ActionPaper>
                        <ToggleButtonGroup
                            size="small"
                            color="primary"
                            value={chartContent}
                            onChange={(event: React.BaseSyntheticEvent) => setChartContent(event.target.value)}
                            exclusive
                        >
                            <ToggleButton value={'INCOME'}>Income</ToggleButton>
                            <ToggleButton value={'SPENDINGS'}>Spendings</ToggleButton>
                        </ToggleButtonGroup>
                    </ActionPaper>
                </Card.HeaderActions>
            </Card.Header>
            <Card.Body sx={{ mt: 2 }}>
                {chartData.length > 0 ? (
                    <ParentSize>
                        {({ width }) => <PieChart width={width} height={width} data={chartData} formatAsCurrency />}
                    </ParentSize>
                ) : warnMsg.length > 0 ? (
                    <Alert severity="warning">{warnMsg}</Alert>
                ) : (
                    <NoResults />
                )}
            </Card.Body>
        </Card>
    );
};
