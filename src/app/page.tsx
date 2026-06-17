import { db } from "..";
import { checks, endpoints } from "../db/schema";
import { desc, sql, gt, eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Sparkline from "../components/Sparkline";
import { AutoRefresh } from "../components/AutoRefresh";
import { getStatusUI } from "../static/status";
import UptimeStat from "../components/UptimeStat";
import { getDashboardData } from "@/lib/queries";
import { auth } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) return null;
  const data = await getDashboardData(userId);

  const {
    allEndpoints,
    latestCheckResults,
    history,
    stats24h,
    stats30d,
    stats7d,
    avgs,
  } = data;

  //Group Sparkline Data
  const sparklines = history.reduce<Record<number, any[]>>((acc, row) => {
    if (!row.id || !row.time) return acc;
    if (!acc[row.id]) acc[row.id] = [];
    acc[row.id].push({
      time: row.time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: row.value ?? 0,
      status: row.status,
    });
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <AutoRefresh interval={30000} />

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground font-medium text-sm">
            Monitoring {allEndpoints.length} services
          </p>
        </div>
      </div>

      {allEndpoints.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground">
          No endpoints yet —{" "}
          <a href="/endpoints" className="underline font-medium">
            add one
          </a>{" "}
          to start monitoring.
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allEndpoints.map((ep) => {
          const last = latestCheckResults.find((l) => l.id === ep.id);
          const hasData = !!last;

          const statusUI = getStatusUI(
            last?.statusCode ?? null,
            last?.isUp ?? false,
            hasData,
          );
          const up24 = Math.round(
            stats24h.find((s) => s.id === ep.id)?.val || 0,
          );
          const up7d = Math.round(
            stats7d.find((s) => s.id === ep.id)?.val || 0,
          );
          const up30d = Math.round(
            stats30d.find((s) => s.id === ep.id)?.val || 0,
          );
          const avg = Math.round(avgs.find((a) => a.id === ep.id)?.val || 0);

          return (
            <Card key={ep.id} className="overflow-hidden border-slate-200">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold">
                    {ep.name}
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {ep.url}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={`${statusUI.bg} ${statusUI.color} border-transparent font-bold`}
                >
                  <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full bg-current ${last?.isUp && "animate-pulse"}`}
                  />
                  {statusUI.label}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold tracking-tight">
                    {avg}ms
                  </div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">
                    Avg Latency (24h)
                  </div>
                </div>

                <div className="h-16 w-full border-y bg-slate-50/30">
                  <Sparkline data={sparklines[ep.id] || []} />
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1">
                  <UptimeStat label="24h" value={up24} color={statusUI.color} />
                  <UptimeStat label="7d" value={up7d} color={statusUI.color} />
                  <UptimeStat
                    label="30d"
                    value={up30d}
                    color={statusUI.color}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
