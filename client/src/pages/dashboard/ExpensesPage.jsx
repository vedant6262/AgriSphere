import { useEffect, useState } from "react";
import { ExpenseManager } from "@/components/expenses/expense-manager";
import { useAppAuth } from "@/context/auth-context";
import { expenseApi } from "@/services/api";

export function ExpensesPage() {
  const { getToken } = useAppAuth();
  const [data, setData] = useState({ expenses: [], monthlyTotals: [] });

  const loadExpenses = async () => {
    const response = await expenseApi.list(getToken);
    setData(response);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">Expense and Profit Planner</p>
        <h2 className="page-title mt-2">Track expenses and predict yield with profit or loss estimation</h2>
      </div>
      <ExpenseManager data={data} getToken={getToken} onCreated={loadExpenses} />
    </div>
  );
}
