import { z } from "zod";
import { createExpense, listExpenses } from "../services/expenses.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const expenseSchema = z.object({
  category: z.enum(["SEEDS", "FERTILIZER", "LABOR", "EQUIPMENT"]),
  amount: z.coerce.number().positive(),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2024).max(2100),
  notes: z.string().optional().default("")
});

export const getExpenses = asyncHandler(async (req, res) => {
  const data = await listExpenses(req.userId);
  res.json(data);
});

export const createExpenseEntry = asyncHandler(async (req, res) => {
  const parsed = expenseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid expense payload.",
      details: parsed.error.flatten()
    });
  }

  const expense = await createExpense(req.userId, parsed.data);
  res.status(201).json({ expense });
});
