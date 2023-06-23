import React from 'react';
import { ActionPaper, Card } from '@/components/Base';
import { PieChart, PieChartData } from '@/components/Charts';
import { NoResults } from '@/components/Core';
import { useFetchSubscriptions } from '@/hooks';
import { Subscription } from '@/models';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ParentSize } from '@visx/responsive';

/**
 * Displays Subscriptions in an easy simple Donut-Chart
 */
export const SubscriptionOverviewChart = () => {
    const { loading, subscriptions } = useFetchSubscriptions();
    const [chartContent, setChartContent] = React.useState<'INCOME' | 'SPENDINGS'>('INCOME');

    /**
     * Returns a list of `INCOME` or `SPENDINGS` subscriptions
     */
    const chartContentSubscriptions = React.useMemo(() => {
        return subscriptions
            .filter((subscription) => (chartContent === 'INCOME' ? subscription.amount > 0 : subscription.amount < 0))
            .sort((a, b) => a.categories.id - b.categories.id);
    }, [subscriptions, chartContent]);

    const chartData = React.useMemo(() => {
        const categoryAmounts: {
            [categoryId: Subscription['id']]: { amount: number; name: Subscription['categories']['name'] };
        } = {};
        for (const subscription of chartContentSubscriptions) {
            const categoryId = subscription.categories.id;
            if (categoryAmounts[categoryId] === undefined) {
                categoryAmounts[categoryId] = {
                    amount: subscription.amount,
                    name: subscription.categories.name,
                };
            } else categoryAmounts[categoryId].amount += subscription.amount;
        }

        const result: PieChartData[] = [];
        for (const categoryId in categoryAmounts) {
            if (categoryAmounts.hasOwnProperty(categoryId)) {
                const { amount, name } = categoryAmounts[categoryId];
                result.push({ label: name, value: amount });
            }
        }

        return result;
    }, [chartContentSubscriptions, chartContent]);

    return (
        <Card>
            <Card.Header>
                <Box>
                    <Card.Title>Subscription</Card.Title>
                    <Card.Subtitle>Your subscription overview</Card.Subtitle>
                </Box>
                <Card.HeaderActions>
                    <ActionPaper>
                        <ToggleButtonGroup
                            size="small"
                            color="primary"
                            value={chartContent}
                            onChange={(event: React.BaseSyntheticEvent) => setChartContent(event.target.value)}
                            exclusive
                            disabled={loading}
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
                        {({ width }) => (
                            <PieChart width={width} height={width} data={chartData} formatAsCurrency showTotalSum />
                        )}
                    </ParentSize>
                ) : (
                    <NoResults />
                )}
            </Card.Body>
        </Card>
    );
};
