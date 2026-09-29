import { getPrisma } from "../lib/prisma.js";
import { fallbackExpenses } from "../utils/fallback-data.js";
import { getFarmSettings } from "./settings.service.js";

const monthlyTotalsFromExpenses = (expenses) => {
  const byMonth = new Map();

  expenses.forEach((expense) => {
    const key = `${expense.year}-${expense.month}`;
    const current = byMonth.get(key) || {
      label: `${expense.month}/${expense.year}`,
      total: 0
    };

    current.total += expense.amount;
    byMonth.set(key, current);
  });

  return Array.from(byMonth.values());
};

export const listExpenses = async (clerkUserId) => {
  const prisma = await getPrisma();

  if (!prisma) {
    return {
      expenses: fallbackExpenses,
      monthlyTotals: monthlyTotalsFromExpenses(fallbackExpenses)
    };
  }

  const profile = await getFarmSettings(clerkUserId);
  const expenses = await prisma.expenseEntry.findMany({
    where: { farmProfileId: profile.id },
    orderBy: [{ year: "asc" }, { month: "asc" }, { createdAt: "asc" }]
  });

  return {
    expenses,
    monthlyTotals: monthlyTotalsFromExpenses(expenses)
  };
};

export const createExpense = async (clerkUserId, data) => {
  const prisma = await getPrisma();

  if (!prisma) {
    return {
      id: `demo-${Date.now()}`,
      ...data
    };
  }

  const profile = await getFarmSettings(clerkUserId);

  return prisma.expenseEntry.create({
    data: {
      farmProfileId: profile.id,
      category: data.category,
      amount: data.amount,
      month: data.month,
      year: data.year,
      notes: data.notes
    }
  });
};
