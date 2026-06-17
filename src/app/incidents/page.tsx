"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { formatDistanceToNow, format, differenceInMinutes } from "date-fns";
import { useState, useEffect } from "react";
import { incidents, endpoints } from "@/src/db/schema";
import { toast } from "sonner";

type SelectIncident = typeof incidents.$inferSelect;
type SelectEndpoint = typeof endpoints.$inferSelect;

type IncidentWithEndpoint = SelectIncident & {
  name: string;
  url: string;
};

export const dynamic = "force-dynamic";

export default function IncidentsPage() {
  const [history, setHistory] = useState<IncidentWithEndpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getAllIncidents = async () => {
      try {
        const [incidentsRes, endpointsRes] = await Promise.all([
          fetch("/api/incidents"),
          fetch("/api/endpoints"),
        ]);

        if (!incidentsRes.ok || !endpointsRes.ok) {
          throw new Error("Failed to fetch");
        }

        const incidentsData: SelectIncident[] = await incidentsRes.json();
        const endpointsData: SelectEndpoint[] = await endpointsRes.json();

        const merged: IncidentWithEndpoint[] = incidentsData.map((incident) => {
          const endpoint = endpointsData.find(
            (e) => e.id === incident.endpoint_id,
          );
          return {
            ...incident,
            name: endpoint?.name ?? "Unknown",
            url: endpoint?.url ?? "Unknown",
          };
        });

        setHistory(merged);
      } catch (error) {
        console.error("Error fetching incidents: ", error);
        toast.error("Error", {
          description: "Failed to load incident history",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getAllIncidents();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Incident History
        </h1>
        <p className="text-zinc-500 mt-1">
          A historical log of all service interruptions and recoveries.
        </p>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table className="px-10">
          <TableHeader>
            <TableRow className="bg-zinc-50/50">
              <TableHead className="font-semibold text-zinc-900 min-w-25">
                Service
              </TableHead>
              <TableHead className="font-semibold text-zinc-900">
                Status
              </TableHead>
              <TableHead className="font-semibold text-zinc-900">
                Started
              </TableHead>
              <TableHead className="font-semibold text-zinc-900">
                Resolved
              </TableHead>
              <TableHead className="text-right font-semibold text-zinc-900">
                Duration
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-zinc-400"
                >
                  Loading incidents…
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-zinc-400"
                >
                  No incidents recorded yet. Everything is running smoothly!
                </TableCell>
              </TableRow>
            ) : (
              history.map((incident) => {
                const isOngoing = !incident.resolved_at;
                const duration = incident.resolved_at
                  ? differenceInMinutes(
                      new Date(incident.resolved_at),
                      new Date(incident.started_at!),
                    )
                  : null;

                return (
                  <TableRow
                    key={incident.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <TableCell>
                      <div className="font-semibold text-zinc-900">
                        {incident.name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate max-w-45">
                        {incident.url}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isOngoing ? (
                        <Badge
                          variant="destructive"
                          className="bg-red-200 hover:bg-red-500 animate-pulse rounded-full px-2 py-0 text-[10px] uppercase"
                        >
                          Ongoing
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200 bg-green-50 rounded-full px-2 py-0 text-[10px] uppercase"
                        >
                          Resolved
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">
                      <div>
                        {format(new Date(incident.started_at!), "MMM d, HH:mm")}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {formatDistanceToNow(new Date(incident.started_at!))}{" "}
                        ago
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">
                      {incident.resolved_at ? (
                        format(new Date(incident.resolved_at), "MMM d, HH:mm")
                      ) : (
                        <span className="text-zinc-300 italic">Pending...</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right  font-bold text-zinc-700 min-w-25">
                      {duration !== null ? (
                        `${duration}m`
                      ) : (
                        <span className="text-red-500">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
