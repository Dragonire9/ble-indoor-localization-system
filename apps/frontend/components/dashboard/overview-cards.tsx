"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export type Trend = "up" | "down" | "neutral";

export interface OverviewStat {
  id: string;
  label: string;
  value: string;
  helper?: string;
  deltaLabel?: string;
  delta?: string;
  trend?: Trend;
}

interface DashboardOverviewCardsProps {
  stats: OverviewStat[];
}

export function DashboardOverviewCards({ stats }: DashboardOverviewCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.id} className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </span>
                  {stat.delta && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        stat.trend === "up" &&
                          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40",
                        stat.trend === "down" &&
                          "bg-red-500/10 text-red-400 border border-red-500/40",
                        !stat.trend && "bg-muted text-muted-foreground border border-muted"
                      )}
                    >
                      {stat.trend === "up" && (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      )}
                      {stat.trend === "down" && (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {stat.delta}
                    </span>
                  )}
                </div>
              </div>
              {stat.deltaLabel && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {stat.deltaLabel}
                </span>
              )}
            </div>
          </CardHeader>
          {stat.helper && (
            <CardContent className="pt-0">
              <CardDescription className="text-xs text-muted-foreground">
                {stat.helper}
              </CardDescription>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
