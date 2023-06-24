import { format, isSameDay } from 'date-fns';
import React from 'react';
import { Card } from '@/components/Base';
import { ActionPaper } from '@/components/Base/ActionPaper.component';
import { CategoryBudget, type CategoryBudgetProps } from '@/components/Budget/CategoryBudget.component';
import { CreateBudgetDrawer, type CreateBudgetDrawerProps } from '@/components/Budget/CreateBudgetDrawer.component';
import { EditBudgetDrawer, type EditBudgetDrawerProps } from '@/components/Budget/EditBudgetDrawer.component';
import { BarChart, type BarChartData } from '@/components/Chart/BarChart.component';
import { PieChart } from '@/components/Chart/PieChart.component';
import { Stats, StatsIconStyle, type StatsProps } from '@/components/Core/Cards/StatsCard.component';
import { CircularProgress } from '@/components/Core/CircularProgress.component';
import { AddFab } from '@/components/Core/FAB/AddFab.component';
import { FabContainer } from '@/components/Core/FAB/FabContainer.component';
import { NoResults } from '@/components/Core/NoResults.component';
import { PageHeader } from '@/components/Layout/PageHeader.component';
import { Transaction } from '@/components/Transaction/Transaction.component';
import { SnackbarContext } from '@/context/Snackbar.context';
import { StoreContext } from '@/context/Store.context';
import { useFetchBudget } from '@/hook/useFetchBudget.hook';
import { useFetchBudgetTransactions } from '@/hook/useFetchBudgetTransactions.hook';
import { useFetchSubscriptions } from '@/hook/useFetchSubscriptions.hook';
import { useScreenSize } from '@/hook/useScreenSize.hook';
import { Budget } from '@/models/Budget.model';
import { getFirstDayOfMonth } from '@/util/date.util';
import { formatBalance } from '@/util/formatBalance.util';
import {
    AddRounded as AddIcon,
    BalanceRounded as BalanceIcon,
    DonutSmallRounded as DonutSmallIcon,
    EventRepeatRounded as EventRepeatRoundedIcon,
    ListRounded as ListIcon,
    PaymentsRounded as PaymentsIcon,
    RemoveRounded as RemoveIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Divider,
    Grid,
    IconButton,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ParentSize } from '@visx/responsive';

interface BudgetRouteHandler {
    onDateFromChange: (value: Date | null, keyboardInputValue?: string | undefined) => void;
    onDateToChange: (value: Date | null, keyboardInputValue?: string | undefined) => void;
    onBudgetDelete: CategoryBudgetProps['onDelete'];
    createBudget: {
        onShowAddBudgetForm: () => void;
        onSetOpen: CreateBudgetDrawerProps['setOpen'];
    };
    editBudget: {
        onSetOpen: EditBudgetDrawerProps['setOpen'];
        onEdit: CategoryBudgetProps['onEdit'];
    };
    charts: {
        onEvent: (bar: BarChartData | null) => void;
        onChangeChart: (event: React.BaseSyntheticEvent) => void;
    };
}

export const DATE_RANGE_INPUT_FORMAT = 'dd.MM';
export type ChartContentType = 'INCOME' | 'SPENDINGS';
export const ChartContentTypes = [
    { type: 'INCOME' as ChartContentType, label: 'Income' },
    { type: 'SPENDINGS' as ChartContentType, label: 'Spendings' },
];

const BudgetRoute = () => {
    const fetchSubscriptions = useFetchSubscriptions();
    const screenSize = useScreenSize();
    const { loading: loadingBudget, budget } = useFetchBudget();
    const { showSnackbar } = React.useContext(SnackbarContext);
    const { setBudgetTransactions } = React.useContext(StoreContext);
    const [chart, setChart] = React.useState<ChartContentType>('INCOME');
    const [dateRange, setDateRange] = React.useState({ from: getFirstDayOfMonth(), to: new Date() });
    const {
        loading: loadingBudgetTransactions,
        refresh: refreshBudgetTransactions,
        budgetTransactions,
    } = useFetchBudgetTransactions(dateRange.from, dateRange.to);
    const [showForm, setShowForm] = React.useState<{ createBudget: boolean; editBudget: Budget | null }>({
        createBudget: false,
        editBudget: null,
    });
    const [categoryStatsVisualizationType, setCategoryStatsVisualizationType] = React.useState<'CHART' | 'LIST'>(
        'CHART'
    );

    const subscriptionCategorySum = React.useMemo(() => {
        const subscriptions = fetchSubscriptions.subscriptions;
        const result = { income: new Map<string, number>(), spendings: new Map<string, number>() };
        if (subscriptions.length === 0) {
            return result;
        }

        // Income
        subscriptions
            .filter((sub) => sub.amount >= 0)
            .forEach((sub) => {
                const categoryName = sub.categories.name,
                    amount = Math.abs(sub.amount);
                if (result.income.has(categoryName)) {
                    const prev = result.income.get(categoryName);
                    result.income.set(categoryName, prev! + amount);
                } else result.income.set(categoryName, amount);
            });

        // Spendings
        subscriptions
            .filter((sub) => sub.amount < 0)
            .forEach((sub) => {
                const categoryName = sub.categories.name,
                    amount = Math.abs(sub.amount);
                if (result.spendings.has(categoryName)) {
                    const prev = result.spendings.get(categoryName);
                    result.spendings.set(categoryName, prev! + amount);
                } else result.spendings.set(categoryName, amount);
            });

        return result;
    }, [fetchSubscriptions.subscriptions]);

    const pageStats = React.useMemo(() => {
        const income = Array.from(subscriptionCategorySum.income).reduce(
            (prev, [_category, amount]) => prev + amount,
            0
        );
        const outcome = Array.from(subscriptionCategorySum.spendings).reduce(
            (prev, [_category, amount]) => prev + amount,
            0
        );
        const plannedBudget = budget.reduce((prev, cur) => prev + cur.budget, 0) || 0;

        return {
            income: income,
            outcome: outcome,
            plannedBudget: plannedBudget,
            unplannedBudget: income - (outcome + plannedBudget),
        };
    }, [subscriptionCategorySum, budget]);

    const StatsCardValues: StatsProps[] = [
        {
            icon: <AddIcon sx={StatsIconStyle} />,
            title: formatBalance(pageStats.income),
            subtitle: 'Fixed income',
        },
        {
            icon: <RemoveIcon sx={StatsIconStyle} />,
            title: formatBalance(pageStats.outcome),
            subtitle: 'Fixed outcome',
        },
        {
            icon: <PaymentsIcon sx={StatsIconStyle} />,
            title: formatBalance(pageStats.plannedBudget),
            subtitle: 'Planned budgets',
        },
        {
            icon: <BalanceIcon sx={StatsIconStyle} />,
            title: formatBalance(pageStats.unplannedBudget),
            subtitle: 'Unplanned balance',
            info: 'Income - (Spendings + Budget Spendings)',
        },
    ];

    const handler: BudgetRouteHandler = {
        onDateFromChange(value, _keyboardInputValue) {
            setDateRange((prev) => ({ ...prev, from: value || new Date() }));
        },
        onDateToChange(value, _keyboardInputValue) {
            setDateRange((prev) => ({ ...prev, from: value || new Date() }));
        },
        onBudgetDelete: async (deleteBudget) => {
            try {
                const deletedBudgets = await deleteBudget;
                if (!deletedBudgets || deletedBudgets.length < 1) throw new Error('No budget deleted');
                await refreshBudgetTransactions(dateRange.from, dateRange.to);
                showSnackbar({ message: `Budget deleted` });
            } catch (error) {
                console.error(error);
                showSnackbar({
                    message: error instanceof Error ? error.message : "Could'nt delete the budget",
                    action: deleteBudget ? (
                        // @ts-ignore
                        <Button onClick={() => handler.onBudgetDelete(deleteBudget)}>Retry</Button>
                    ) : undefined,
                });
            }
        },
        createBudget: {
            onShowAddBudgetForm() {
                setShowForm((prev) => ({ ...prev, createBudget: true }));
            },
            onSetOpen(show) {
                setShowForm((prev) => ({ ...prev, createBudget: show }));
            },
        },
        editBudget: {
            onSetOpen(show) {
                if (!show) setShowForm((prev) => ({ ...prev, editBudget: null }));
            },
            onEdit: (budget) => {
                setShowForm((prev) => ({ ...prev, editBudget: budget }));
            },
        },
        charts: {
            onEvent(bar) {
                if (!bar && !budgetTransactions) return;
                setBudgetTransactions({
                    type: 'UPDATE_DATA',
                    data: {
                        ...budgetTransactions!,
                        selected: {
                            date: new Date(bar!.label),
                            amount: bar!.value,
                        },
                    },
                });
            },
            onChangeChart(event) {
                const newChart = event.target.value as ChartContentType;
                if (newChart === chart) return;
                if (!budgetTransactions) return;
                setChart(newChart);
                const transactions =
                    newChart === 'INCOME' ? budgetTransactions.income.daily : budgetTransactions.spendings.daily;
                const today = transactions[transactions.length - 1];
                setBudgetTransactions({
                    type: 'UPDATE_DATA',
                    data: {
                        ...budgetTransactions!,
                        selected: {
                            amount: today.amount,
                            date: new Date(today.date),
                        },
                    },
                });
            },
        },
    };

    React.useEffect(() => {
        refreshBudgetTransactions(dateRange.from, dateRange.to);
    }, [dateRange]);

    return (
        <Grid container spacing={3}>
            <PageHeader title="Budget" description="How much did u spent this month?" />

            <Grid item xs={12} md={12} lg={5} xl={5}>
                <Card>
                    <Card.Header sx={{ mb: 2 }}>
                        <Box>
                            <Card.Title>Transactions</Card.Title>
                            <Card.Subtitle>Your category statistics</Card.Subtitle>
                        </Box>

                        <Card.HeaderActions>
                            <ActionPaper>
                                <ToggleButtonGroup
                                    size="small"
                                    color="primary"
                                    value={chart}
                                    onChange={handler.charts.onChangeChart}
                                    exclusive
                                >
                                    {ChartContentTypes.map((button) => (
                                        <ToggleButton key={button.type} value={button.type}>
                                            {button.label}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </ActionPaper>
                        </Card.HeaderActions>
                    </Card.Header>
                    <Card.Header>
                        <Box>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                {screenSize === 'small' ? (
                                    <MobileDatePicker
                                        label="From"
                                        inputFormat={DATE_RANGE_INPUT_FORMAT}
                                        value={dateRange.from}
                                        onChange={handler.onDateFromChange}
                                        renderInput={(params) => (
                                            <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                                        )}
                                    />
                                ) : (
                                    <DesktopDatePicker
                                        label="From"
                                        inputFormat={DATE_RANGE_INPUT_FORMAT}
                                        value={dateRange.from}
                                        onChange={handler.onDateFromChange}
                                        renderInput={(params) => (
                                            <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                                        )}
                                    />
                                )}

                                {screenSize === 'small' ? (
                                    <MobileDatePicker
                                        label="To"
                                        inputFormat={DATE_RANGE_INPUT_FORMAT}
                                        value={dateRange.to}
                                        onChange={handler.onDateToChange}
                                        renderInput={(params) => (
                                            <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                                        )}
                                    />
                                ) : (
                                    <DesktopDatePicker
                                        label="To"
                                        inputFormat={DATE_RANGE_INPUT_FORMAT}
                                        value={dateRange.to}
                                        onChange={handler.onDateToChange}
                                        renderInput={(params) => (
                                            <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                                        )}
                                    />
                                )}
                            </LocalizationProvider>
                        </Box>
                    </Card.Header>
                    <Card.Body>
                        {loadingBudgetTransactions ? (
                            <CircularProgress />
                        ) : budgetTransactions ? (
                            <Paper elevation={0} sx={{ mt: '1rem' }}>
                                {budgetTransactions.selected && (
                                    <Box sx={{ ml: 2, mt: 1 }}>
                                        <Typography variant="caption">
                                            {isSameDay(budgetTransactions.selected.date, new Date())
                                                ? 'Today'
                                                : format(budgetTransactions.selected.date, 'dd.MM.yy')}
                                        </Typography>
                                        <Typography variant="subtitle1">
                                            {formatBalance(budgetTransactions.selected.amount)}
                                        </Typography>
                                    </Box>
                                )}

                                <ParentSize>
                                    {({ width }) => (
                                        <BarChart
                                            width={width}
                                            height={width * 0.6}
                                            data={budgetTransactions[
                                                chart === 'INCOME' ? 'income' : 'spendings'
                                            ].daily.map((day) => ({
                                                label: day.date.toString(),
                                                value: day.amount,
                                            }))}
                                            onEvent={handler.charts.onEvent}
                                            events
                                        />
                                    )}
                                </ParentSize>
                            </Paper>
                        ) : (
                            <NoResults sx={{ mt: 2 }} text="Nothing was returned" />
                        )}

                        <Divider sx={{ mt: 2 }} />

                        {loadingBudgetTransactions ? (
                            <CircularProgress />
                        ) : chart === 'INCOME' ? (
                            budgetTransactions && budgetTransactions.income.grouped.length > 0 ? (
                                budgetTransactions.income.grouped.map(({ category, sum }) => (
                                    <Transaction
                                        key={category.id}
                                        title={category.name}
                                        subtitle={category.description || 'No description'}
                                        amount={sum}
                                    />
                                ))
                            ) : (
                                <NoResults sx={{ mt: 2 }} text="No results for the timespan" />
                            )
                        ) : budgetTransactions && budgetTransactions.spendings.grouped.length > 0 ? (
                            budgetTransactions.spendings.grouped.map(({ category, sum }) => (
                                <Transaction
                                    key={category.id}
                                    title={category.name}
                                    subtitle={category.description || 'No description'}
                                    amount={Math.abs(sum)}
                                />
                            ))
                        ) : (
                            <NoResults sx={{ mt: 2 }} text="No results for the timespan" />
                        )}
                    </Card.Body>
                </Card>
            </Grid>

            <Grid item xs={12} md={12} lg={7} xl={7}>
                {/* Stats */}
                <Grid container spacing={2}>
                    {StatsCardValues.map((item, index) => (
                        <Grid key={index} item xs={6} md={3}>
                            <Stats {...item} />
                        </Grid>
                    ))}
                </Grid>

                {/* Set category budgets */}
                <Card sx={{ mt: 2 }}>
                    <Card.Header>
                        <Box>
                            <Card.Title>Category Budgets</Card.Title>
                            <Card.Subtitle>Set a limit for your spending</Card.Subtitle>
                        </Box>
                        <Card.HeaderActions>
                            <ActionPaper>
                                <Tooltip title="Set Budget">
                                    <IconButton color="primary" onClick={handler.createBudget.onShowAddBudgetForm}>
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </ActionPaper>
                        </Card.HeaderActions>
                    </Card.Header>
                    <Card.Body>
                        {loadingBudget ? (
                            <CircularProgress />
                        ) : budget.length > 0 ? (
                            budget.map((item) => (
                                <Box key={item.id} sx={{ mt: 1 }}>
                                    <CategoryBudget
                                        budget={item}
                                        onEdit={handler.editBudget.onEdit}
                                        onDelete={handler.onBudgetDelete}
                                    />
                                </Box>
                            ))
                        ) : (
                            <NoResults sx={{ mt: 2 }} text="No budget found" />
                        )}
                    </Card.Body>
                </Card>

                {/* Charts */}
                <Grid container columnSpacing={2}>
                    {[
                        { label: 'Income', type: 'income' },
                        { label: 'Spendings', type: 'spendings' },
                    ].map((item) => (
                        <Grid key={item.type} item xs={12} md={6}>
                            <Card sx={{ mt: 2 }}>
                                <Card.Header>
                                    <Box>
                                        <Card.Title>{item.label}</Card.Title>
                                        <Card.Subtitle>Defined as Subscriptions</Card.Subtitle>
                                    </Box>

                                    <Card.HeaderActions>
                                        <ActionPaper>
                                            <ToggleButtonGroup
                                                size="small"
                                                color="primary"
                                                value={categoryStatsVisualizationType}
                                                onChange={() =>
                                                    setCategoryStatsVisualizationType((prev) =>
                                                        prev === 'CHART' ? 'LIST' : 'CHART'
                                                    )
                                                }
                                                exclusive
                                            >
                                                {[
                                                    { type: 'CHART', label: <DonutSmallIcon /> },
                                                    { type: 'LIST', label: <ListIcon /> },
                                                ].map((button) => (
                                                    <ToggleButton key={button.type} value={button.type}>
                                                        {button.label}
                                                    </ToggleButton>
                                                ))}
                                            </ToggleButtonGroup>
                                        </ActionPaper>
                                    </Card.HeaderActions>
                                </Card.Header>
                                <Card.Body sx={{ mt: 1 }}>
                                    {categoryStatsVisualizationType === 'CHART' ? (
                                        <ParentSize>
                                            {({ width }) => (
                                                <PieChart
                                                    width={width}
                                                    height={width}
                                                    // @ts-ignore
                                                    data={Array.from(subscriptionCategorySum[item.type]).map(
                                                        // @ts-ignore
                                                        ([category, amount]) => ({
                                                            label: category,
                                                            value: amount,
                                                        })
                                                    )}
                                                    formatAsCurrency
                                                    showTotalSum
                                                />
                                            )}
                                        </ParentSize>
                                    ) : (
                                        // @ts-ignore
                                        Array.from(subscriptionCategorySum[item.type]).map(([category, amount]) => (
                                            <Transaction
                                                icon={<EventRepeatRoundedIcon />}
                                                title={category}
                                                subtitle=""
                                                amount={amount}
                                            />
                                        ))
                                    )}
                                </Card.Body>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Grid>

            <FabContainer>
                <AddFab onClick={() => handler.createBudget.onSetOpen(true)} />
            </FabContainer>

            <CreateBudgetDrawer open={showForm.createBudget} setOpen={handler.createBudget.onSetOpen} />

            <EditBudgetDrawer
                open={showForm.editBudget !== null}
                setOpen={handler.editBudget.onSetOpen}
                budget={showForm.editBudget}
            />
        </Grid>
    );
};

export default BudgetRoute;
