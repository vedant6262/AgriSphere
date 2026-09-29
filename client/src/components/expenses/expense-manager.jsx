import { useState } from "react";
import "chart.js/auto";
import { Bar, Pie } from "react-chartjs-2";
import { expenseApi } from "@/services/api";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/context/theme-context";
import { formatCurrency } from "@/lib/utils";

const categories = ["SEEDS", "FERTILIZER", "LABOR", "EQUIPMENT"];

const toNumber = (value) => Number(value || 0);

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

export function ExpenseManager({ data, getToken, onCreated }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    category: "SEEDS",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    notes: ""
  });

  const [cropForm, setCropForm] = useState({
    crop: "",
    area: "1",
    expectedYieldPerAcre: "2600",
    marketPricePerKg: "22",
    seedCost: "0",
    fertilizerCost: "0",
    laborCost: "0",
    waterCost: "0"
  });

  const [cropPlans, setCropPlans] = useState([]);

  const chartData = {
    labels: data.monthlyTotals.map((entry) => entry.label),
    datasets: [
      {
        label: "Monthly expenses",
        data: data.monthlyTotals.map((entry) => entry.total),
        backgroundColor: "#16A34A"
      }
    ]
  };

  const groupedTotals = categories.map((category) => ({
    category,
    total: data.expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  }));

  const pieData = {
    labels: groupedTotals.map((entry) => entry.category),
    datasets: [
      {
        data: groupedTotals.map((entry) => entry.total),
        backgroundColor: ["#16A34A", "#22C55E", "#15803D", "#86EFAC"]
      }
    ]
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await expenseApi.create({ ...form, amount: Number(form.amount) }, getToken);
    setForm({ ...form, amount: "", notes: "" });
    await onCreated();
  };

  const addCropPlan = (event) => {
    event.preventDefault();

    const cropName = cropForm.crop.trim();

    if (!cropName) {
      return;
    }

    const area = toNumber(cropForm.area);
    const expectedYieldPerAcre = toNumber(cropForm.expectedYieldPerAcre);
    const marketPricePerKg = toNumber(cropForm.marketPricePerKg);
    const seedCost = toNumber(cropForm.seedCost);
    const fertilizerCost = toNumber(cropForm.fertilizerCost);
    const laborCost = toNumber(cropForm.laborCost);
    const waterCost = toNumber(cropForm.waterCost);

    const totalCost = seedCost + fertilizerCost + laborCost + waterCost;
    const expectedYieldKg = Math.round(area * expectedYieldPerAcre);
    const estimatedRevenue = Math.round(expectedYieldKg * marketPricePerKg);
    const profit = estimatedRevenue - totalCost;

    const nextPlan = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      crop: cropName,
      area,
      expectedYieldPerAcre,
      expectedYieldKg,
      marketPricePerKg,
      seedCost,
      fertilizerCost,
      laborCost,
      waterCost,
      totalCost,
      estimatedRevenue,
      profit
    };

    setCropPlans((current) => [nextPlan, ...current]);
    setCropForm((current) => ({ ...current, crop: "", seedCost: "0", fertilizerCost: "0", laborCost: "0", waterCost: "0" }));
  };

  const removeCropPlan = (id) => {
    setCropPlans((current) => current.filter((plan) => plan.id !== id));
  };

  const aggregateRevenue = cropPlans.reduce((sum, plan) => sum + plan.estimatedRevenue, 0);
  const aggregateCost = cropPlans.reduce((sum, plan) => sum + plan.totalCost, 0);
  const aggregateProfit = cropPlans.reduce((sum, plan) => sum + plan.profit, 0);

  const seedTotal = cropPlans.reduce((sum, plan) => sum + plan.seedCost, 0);
  const fertilizerTotal = cropPlans.reduce((sum, plan) => sum + plan.fertilizerCost, 0);
  const laborTotal = cropPlans.reduce((sum, plan) => sum + plan.laborCost, 0);
  const waterTotal = cropPlans.reduce((sum, plan) => sum + plan.waterCost, 0);
  const profitTotal = Math.max(aggregateProfit, 0);
  const lossTotal = Math.max(-aggregateProfit, 0);

  const circularBreakdownEntries = [
    { label: "Seed Cost", value: seedTotal, color: "#22C55E" },
    { label: "Fertilizer Cost", value: fertilizerTotal, color: "#0EA5E9" },
    { label: "Labor Cost", value: laborTotal, color: "#F59E0B" },
    { label: "Water Cost", value: waterTotal, color: "#6366F1" },
    { label: "Net Profit", value: profitTotal, color: "#16A34A" },
    { label: "Net Loss", value: lossTotal, color: "#DC2626" }
  ].filter((entry) => entry.value > 0);

  const circularTotal = circularBreakdownEntries.reduce((sum, entry) => sum + entry.value, 0);

  const circularAnalyticsData = {
    labels: circularBreakdownEntries.map((entry) => entry.label),
    datasets: [
      {
        data: circularBreakdownEntries.map((entry) => entry.value),
        backgroundColor: circularBreakdownEntries.map((entry) => entry.color),
        borderWidth: 0
      }
    ]
  };

  const profitLossChartData = {
    labels: cropPlans.map((plan) => plan.crop),
    datasets: [
      {
        label: "Profit / Loss",
        data: cropPlans.map((plan) => plan.profit),
        backgroundColor: cropPlans.map((plan) => (plan.profit >= 0 ? "#16A34A" : "#DC2626"))
      }
    ]
  };

  return (
    <div className="space-y-5">
      <DashboardCard
        title="Farmer Profit Prediction Dashboard"
        description="Add multiple crops with full cost breakdown and get yield, revenue, profit or loss insights in INR."
        className="overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/10"
      >
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <form className="space-y-4" onSubmit={addCropPlan}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Crop (any crop name)</label>
              <Input
                placeholder="Example: Maize"
                value={cropForm.crop}
                onChange={(event) => setCropForm((current) => ({ ...current, crop: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Area (acres)</label>
              <Input
                placeholder="Area in acres"
                type="number"
                min="0"
                step="0.1"
                value={cropForm.area}
                onChange={(event) => setCropForm((current) => ({ ...current, area: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expected yield per acre (kg)</label>
              <Input
                placeholder="Yield estimate per acre"
                type="number"
                min="0"
                step="1"
                value={cropForm.expectedYieldPerAcre}
                onChange={(event) => setCropForm((current) => ({ ...current, expectedYieldPerAcre: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Market price (per kg)</label>
              <Input
                placeholder="Selling price per kg"
                type="number"
                min="0"
                step="0.1"
                value={cropForm.marketPricePerKg}
                onChange={(event) => setCropForm((current) => ({ ...current, marketPricePerKg: event.target.value }))}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Seed cost</label>
                <Input type="number" min="0" step="1" value={cropForm.seedCost} onChange={(event) => setCropForm((current) => ({ ...current, seedCost: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fertilizer cost</label>
                <Input type="number" min="0" step="1" value={cropForm.fertilizerCost} onChange={(event) => setCropForm((current) => ({ ...current, fertilizerCost: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Labor cost</label>
                <Input type="number" min="0" step="1" value={cropForm.laborCost} onChange={(event) => setCropForm((current) => ({ ...current, laborCost: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Water cost</label>
                <Input type="number" min="0" step="1" value={cropForm.waterCost} onChange={(event) => setCropForm((current) => ({ ...current, waterCost: event.target.value }))} />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Add Crop for Prediction
            </Button>
          </form>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-background/70 p-4">
                <p className="card-label">Total cost</p>
                <p className="mt-2 text-xl font-semibold">{formatInr(aggregateCost)}</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-background/70 p-4">
                <p className="card-label">Estimated revenue</p>
                <p className="mt-2 text-xl font-semibold">{formatInr(aggregateRevenue)}</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-background/70 p-4">
                <p className="card-label">Overall profit / loss</p>
                <p className={`mt-2 text-xl font-semibold ${aggregateProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {formatInr(aggregateProfit)}
                </p>
              </div>
            </div>

            <div className="h-[260px] rounded-2xl border border-emerald-500/20 bg-background/70 p-3">
              {cropPlans.length ? (
                <Bar
                  data={profitLossChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: {
                        ticks: {
                          color: isDark ? "#9CA3AF" : "#6B7280"
                        },
                        grid: {
                          color: isDark ? "rgba(148,163,184,0.18)" : "rgba(148,163,184,0.14)"
                        }
                      },
                      x: {
                        ticks: {
                          color: isDark ? "#D1D5DB" : "#374151"
                        },
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Add at least one crop to generate the profit/loss graph.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-background/70 p-4">
              <p className="section-title">Circular Expense and Profit Analytics</p>
              <p className="mt-1 text-sm text-muted-foreground">Percentage share of each cost bucket and net profit/loss.</p>

              <div className="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <div className="h-[230px] rounded-2xl border border-border bg-background/60 p-3">
                  {circularBreakdownEntries.length ? (
                    <Pie
                      data={circularAnalyticsData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false }
                        },
                        cutout: "58%"
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Add crop plans to view circular analytics.</div>
                  )}
                </div>

                <div className="space-y-2">
                  {circularBreakdownEntries.map((entry) => {
                    const percent = circularTotal > 0 ? (entry.value / circularTotal) * 100 : 0;
                    return (
                      <div key={entry.label} className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-sm">{entry.label}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{percent.toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">{formatInr(entry.value)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {cropPlans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-border bg-background/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{plan.crop}</p>
                      <p className="text-xs text-muted-foreground">
                        Area: {plan.area} acres | Yield: {plan.expectedYieldKg.toLocaleString()} kg | Market: {formatCurrency(plan.marketPricePerKg)}/kg
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Seed {formatCurrency(plan.seedCost)} + Fertilizer {formatCurrency(plan.fertilizerCost)} + Labor {formatCurrency(plan.laborCost)} + Water {formatCurrency(plan.waterCost)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total cost</p>
                      <p className="font-semibold">{formatInr(plan.totalCost)}</p>
                      <p className={`mt-1 text-sm font-semibold ${plan.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatInr(plan.profit)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeCropPlan(plan.id)}
                        className="mt-2 text-xs text-muted-foreground underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardCard title="Record Expense" description="Track seeds, fertilizer, labor, and equipment costs.">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <select
              className="h-11 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <Input placeholder="Amount" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Month" type="number" value={form.month} onChange={(event) => setForm({ ...form, month: Number(event.target.value) })} />
              <Input placeholder="Year" type="number" value={form.year} onChange={(event) => setForm({ ...form, year: Number(event.target.value) })} />
            </div>
            <Input placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            <Button className="w-full" type="submit">
              Save expense
            </Button>
          </form>
        </DashboardCard>

        <DashboardCard title="Expense Analytics" description="Pie chart by category and monthly trend overview.">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-[220px] rounded-2xl border border-border bg-background/60 p-3">
                <Pie
                  data={pieData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: isDark ? "#E5E7EB" : "#374151"
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="h-[220px] rounded-2xl border border-border bg-background/60 p-3">
                <Bar
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: {
                        ticks: {
                          color: isDark ? "#9CA3AF" : "#6B7280"
                        },
                        grid: {
                          color: isDark ? "rgba(148,163,184,0.18)" : "rgba(148,163,184,0.14)"
                        }
                      },
                      x: {
                        ticks: {
                          color: isDark ? "#D1D5DB" : "#374151"
                        },
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {data.expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-3 transition hover:bg-background/80">
                  <div>
                    <p className="font-medium">{expense.category}</p>
                    <p className="text-sm text-muted-foreground">{expense.notes || "No notes"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatInr(expense.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.month}/{expense.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
