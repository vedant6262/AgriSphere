import express from "express";
import { createExpenseEntry, getExpenses } from "../controllers/expenses.controller.js";
import { requireUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireUser, getExpenses);
router.post("/", requireUser, createExpenseEntry);

export default router;
