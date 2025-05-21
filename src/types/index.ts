export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export type ExpenseCategory = {
  id: string;
  name: string;
  color: string;
};

export interface ExpenseSummary {
  totalAmount: number;
  categoryBreakdown: {
    [category: string]: number;
  };
}