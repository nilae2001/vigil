export type Endpoints = {
  id: number;
  name: string;
  url: string;
  method: string;
  expected_status: number | undefined;
  interval_seconds: number;
  is_active: boolean;
  created_at: Date | undefined;
};
