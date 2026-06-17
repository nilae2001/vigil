export const getStatusUI = (
  status: number | null,
  isUp: boolean,
  hasData: boolean,
) => {
  if (!hasData) {
    return {
      color: "text-slate-500",
      bg: "bg-slate-100",
      label: "Pending...",
    };
  }
  if (status && status >= 300 && status < 400) {
    return {
      color: "text-cyan-700",
      bg: "bg-cyan-50",
      label: `Redirect ${status}`,
    };
  }

  // 2. Handle failures
  if (!isUp) {
    if (status === 408)
      return {
        color: "text-purple-600",
        bg: "bg-purple-100",
        label: "Timeout",
      };
    if (status && status >= 400 && status < 500)
      return {
        color: "text-orange-600",
        bg: "bg-orange-100",
        label: `Error ${status}`,
      };

    // Everything else (usually 5xx or network crash)
    return {
      color: "text-red-600",
      bg: "bg-red-100",
      label: status ? `Error ${status}` : "Offline",
    };
  }

  // 3. Healthy (2xx)
  return {
    color: "text-green-600",
    bg: "bg-green-100",
    label: "Online",
  };
};
