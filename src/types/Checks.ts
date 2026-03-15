export type Checks = {
  id: number;
  endpoint_id: number;
  timestamp: Date;
  status_code: number;
  response_time: number;
  is_up: boolean;
  error_message: string;
};
