"use client";

import { useForm } from "react-hook-form";
import { EndpointFormData } from "@/src/types/EndpointFormData";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useEffect, useState } from "react";
import { endpoints } from "@/src/db/schema";
import EndpointList from "@/src/components/EndpointList";
import { toast } from "sonner";

export default function AddEndpointForm() {
  type SelectEndpoint = typeof endpoints.$inferSelect;

  const [allEndpoints, setAllEndpoints] = useState<SelectEndpoint[] | null>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EndpointFormData>();

  const onSubmit = async (data: EndpointFormData) => {
    try {
      const response = await fetch("/api/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Success", {
          description: "Endpoint added successfully",
        });

        reset();

        await getAllEndpoints();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Error", {
        description: "Something went wrong while adding Endpoing",
      });
    }
  };

  const getAllEndpoints = async () => {
    const response = await fetch("/api/endpoints", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return;
    const data: SelectEndpoint[] = await response.json();
    setAllEndpoints(data);
  };

  useEffect(() => {
    getAllEndpoints();
  }, []);

  return (
    <div className="font-sans w-full max-w-lg mx-auto p-6">
      <div
        className="rounded-2xl bg-white border border-zinc-100"
        style={{ boxShadow: "0 8px 48px 0 rgba(60,60,80,0.10)" }}
      >
        <div className="px-8 pt-8 pb-5">
          <h2 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
            New endpoint
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Add a URL to monitor and configure how often to check it.
          </p>
        </div>

        <div className="h-px bg-zinc-100 mx-8" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-8 pt-6 pb-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="endpoint-name"
              className="text-sm font-medium text-zinc-700"
            >
              Name
            </Label>
            <Input
              id="endpoint-name"
              placeholder="e.g. Production API"
              {...register("name", { required: "Name is required" })}
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-300 text-sm focus:bg-white focus:border-zinc-400 focus:ring-0 transition-colors"
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="endpoint-url"
              className="text-sm font-medium text-zinc-700"
            >
              URL
            </Label>
            <Input
              id="endpoint-url"
              placeholder="https://example.com/health"
              {...register("url", { required: "URL is required" })}
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-300 text-sm focus:bg-white focus:border-zinc-400 focus:ring-0 transition-colors"
            />
            {errors.url && (
              <p className="text-xs text-red-400">{errors.url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="method"
                className="text-sm font-medium text-zinc-700"
              >
                Method
              </Label>
              <select
                id="method"
                {...register("method")}
                className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm px-3 focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23a1a1aa' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "2rem",
                }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="HEAD">HEAD</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="expected_status"
                className="text-sm font-medium text-zinc-700"
              >
                Expected status
              </Label>
              <Input
                id="expected_status"
                type="number"
                placeholder="200"
                {...register("expected_status", {
                  valueAsNumber: true,
                  required: "Required",
                })}
                className="h-10 rounded-lg border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-300 text-sm focus:bg-white focus:border-zinc-400 focus:ring-0 transition-colors"
              />
              {errors.expected_status && (
                <p className="text-xs text-red-400">
                  {errors.expected_status.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="interval_seconds"
              className="text-sm font-medium text-zinc-700"
            >
              Check interval
            </Label>
            <div className="relative">
              <Input
                id="interval_seconds"
                type="number"
                placeholder="60"
                {...register("interval_seconds", {
                  valueAsNumber: true,
                  required: "Interval is required",
                })}
                className="h-10 rounded-lg border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-300 text-sm pr-14 focus:bg-white focus:border-zinc-400 focus:ring-0 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none select-none">
                sec
              </span>
            </div>
            {errors.interval_seconds && (
              <p className="text-xs text-red-400">
                {errors.interval_seconds.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            suppressHydrationWarning
            className="mt-1 h-10 w-full rounded-lg bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-medium tracking-wide transition-colors"
          >
            Add endpoint
          </Button>
        </form>
      </div>
      <EndpointList allEndpoints={allEndpoints} onDelete={getAllEndpoints} />
    </div>
  );
}
