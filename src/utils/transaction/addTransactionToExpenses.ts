import type { IExpenseTransactionDTO } from '../../types/transaction.type';
import { IExpense } from '../../types/transaction.interface';

export function addTransactionToExpenses(
  expenseTransaction: IExpenseTransactionDTO,
  expenses: IExpense[],
  updateExpenses: (updatedExpenses: IExpense[]) => void
) {
  if (expenseTransaction.sum > 0) return;

  const index = expenses.findIndex(
    (expense) => expense.category.id === expenseTransaction.category.id
  );
  if (index > 0) {
    const outdated = expenses[index];
    expenses[index] = {
      ...outdated,
      sum: Math.abs(outdated.sum) + Math.abs(expenseTransaction.sum),
    };
    updateExpenses(expenses);
  } else updateExpenses([...expenses, expenseTransaction]);
}
