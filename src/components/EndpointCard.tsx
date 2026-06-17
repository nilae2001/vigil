import { endpoints } from "../db/schema";
import { methodColors } from "../static/methodColors";
import { formatInterval } from "../static/intervalFormat";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type SelectEndpoint = typeof endpoints.$inferSelect;

export function EndpointCard({
  e,
  onDelete,
}: {
  e: SelectEndpoint;
  onDelete: () => void;
}) {
  const method = methodColors[e.method] ?? {
    bg: "bg-zinc-100",
    text: "text-zinc-500",
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/endpoints/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      onDelete();
      toast.success("Deleted", {
        description: "Endpoint successfully deleted",
      });
    } catch {
      toast.error("Error", {
        description: "Something went wrong while deleting endpoint",
      });
    }
  };

  return (
    <div className="font-sans group flex items-center justify-between gap-4 px-5 py-4 bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all duration-150">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 relative flex h-2 w-2">
          {e.is_active && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${e.is_active ? "bg-emerald-400" : "bg-zinc-300"}`}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-800 truncate">{e.name}</p>
          <p className="text-xs text-zinc-400 truncate">{e.url}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge
          className={`text-[11px] font-semibold ${method.bg} ${method.text} border-0 shadow-none`}
        >
          {e.method}
        </Badge>

        {e.expected_status && (
          <Badge
            variant="outline"
            className="text-[11px] font-medium text-zinc-500"
          >
            {e.expected_status}
          </Badge>
        )}

        <Badge
          variant="outline"
          className="text-[11px] font-medium text-zinc-400"
        >
          ↻ {formatInterval(e.interval_seconds)}
        </Badge>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 h-7 w-7 text-zinc-300 hover:text-red-400 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="font-sans">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete endpoint?</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-medium text-zinc-700">{e.name}</span> will
                be permanently removed and monitoring will stop.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleDelete(e.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
