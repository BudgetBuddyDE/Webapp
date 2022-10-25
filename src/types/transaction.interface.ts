export type IExpense = {
  sum: number;
  category: { id: number; name: string; description: string | null };
  created_by: string;
};

export type IIncome = {
  sum: number;
  category: { id: number; name: string; description: string | null };
  created_by: string;
};
