export type EndpointFormData = {
  name: string;
  url: string;
  method: "GET" | "POST" | "HEAD";
  expected_status: number;
  interval_seconds: number;
};
