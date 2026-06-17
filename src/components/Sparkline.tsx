"use client";

import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";

interface SparklineProps {
  data: { time: string; value: number; status?: number | null }[];
}

export default function Sparkline({ data }: SparklineProps) {
  // If no data, return a placeholder to prevent the -1 error
  if (!data || data.length === 0) {
    return <div className="h-16 w-full bg-slate-50 animate-pulse rounded" />;
  }

  const getStatusColor = (status: number | null) => {
    if (!status) return "text-slate-400"; // No data
    if (status >= 200 && status < 300) return "text-green-500"; // Success
    if (status >= 300 && status < 400) return "text-cyan-500"; // Redirect
    if (status === 408) return "text-purple-600 font-bold"; // Timeout (
    if (status >= 400 && status < 500) return "text-orange-500"; // Client Error
    return "text-red-500"; // 500+ Server Error
  };

  return (
    /* Fix: Use a hardcoded height (h-16 = 64px) and min-w-0 to fix grid scaling */
    <div className="h-16 w-full min-w-0" style={{ position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm text-[10px] uppercase">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-muted-foreground">
                        {item.time}
                      </span>
                      <span className="font-bold">{item.value}ms</span>
                      {item.status && (
                        <span
                          className={`${getStatusColor(item.status)} font-bold`}
                        >
                          {item.status === 408
                            ? "TIMEOUT (408)"
                            : `Status: ${item.status}`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
