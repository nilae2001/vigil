import { endpoints } from "../db/schema";
import { EndpointCard } from "./EndpointCard";

type SelectEndpoint = typeof endpoints.$inferSelect;

export default function EndpointList({
  allEndpoints,
  isLoading,
  onDelete,
}: {
  allEndpoints: SelectEndpoint[] | null | undefined;
  isLoading: boolean;
  onDelete: () => void;
}) {
  if (isLoading) {
    return (
      <div className="font-sans text-center py-16 text-sm text-zinc-300">
        Loading endpoints…
      </div>
    );
  }

  if (!allEndpoints?.length) {
    return (
      <div className="font-sans text-center py-16 text-sm text-zinc-300">
        No endpoints yet — add one above.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {allEndpoints.map((e) => (
        <EndpointCard key={e.id} e={e} onDelete={onDelete} />
      ))}
    </div>
  );
}
