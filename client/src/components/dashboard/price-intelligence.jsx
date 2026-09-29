import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { useTheme } from "@/context/theme-context";

export function PriceIntelligence({ prices = [] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const priceFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
    maximumFractionDigits: 0
  });
  const formatPrice = (value) => priceFormatter.format(Number(value || 0));

  const data = {
    labels: prices.map((entry) => entry.crop),
    datasets: [
      {
        label: "Daily modal price (INR/quintal)",
        data: prices.map((entry) => entry.price),
        borderRadius: 14,
        backgroundColor: ["#16A34A", "#22C55E", "#15803D", "#4ADE80"]
      }
    ]
  };

  return (
    <DashboardCard id="market-prices" title="Market Prices" description="Current market signals and trend direction.">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="h-[260px]">
          <Bar
            data={data}
            options={{
              maintainAspectRatio: false,
              animation: {
                duration: 950
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => formatPrice(context.parsed.y)
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    color: isDark ? "#9CA3AF" : "#6B7280",
                    callback: (value) => formatPrice(value)
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
        <div className="space-y-3">
          {prices.map((item) => (
            <div key={`${item.crop}-${item.market}`} className="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3 transition hover:bg-background">
              <div>
                <p className="font-medium">{item.crop}</p>
                <p className="text-sm text-muted-foreground">{item.market}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(item.price)}</p>
                {item.change ? (
                  <p className={`inline-flex items-center gap-1 text-sm ${item.change >= 0 ? "text-primary" : "text-red-500"}`}>
                    {item.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {item.change}%
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Daily modal price</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
