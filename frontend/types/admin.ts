export interface AdminStats {
  totalCalls: number;
  totalUsers: number;
  totalDocuments: number;
  totalPersonas: number;

  todayCalls: number;
  avgDuration: number;
  successRate: number;
}