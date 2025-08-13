export interface DateRange {
    startDate: Date;
    endDate: Date;
}
export interface ReportFilters {
    dateRange: DateRange;
    roomIds?: string[];
    tenantIds?: string[];
    contractIds?: string[];
    status?: string[];
}
export interface RevenueReportData {
    period: string;
    month: number;
    year: number;
    monthName: string;
    paidRevenue: number;
    pendingRevenue: number;
    totalRevenue: number;
    paidBills: number;
    unpaidBills: number;
    totalBills: number;
    overdueBills: number;
}
export interface OccupancyReportData {
    period: string;
    month: number;
    year: number;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    maintenanceRooms: number;
    reservedRooms: number;
    occupancyRate: number;
}
export interface TenantReportData {
    period: string;
    month: number;
    year: number;
    totalTenants: number;
    activeContracts: number;
    expiredContracts: number;
    terminatedContracts: number;
    newTenants: number;
    departedTenants: number;
}
export interface BillReportData {
    period: string;
    month: number;
    year: number;
    totalBills: number;
    paidBills: number;
    unpaidBills: number;
    overdueBills: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    averageBillAmount: number;
}
export interface ContractReportData {
    period: string;
    month: number;
    year: number;
    totalContracts: number;
    activeContracts: number;
    expiredContracts: number;
    terminatedContracts: number;
    newContracts: number;
    expiringContracts: number;
    averageContractDuration: number;
}
export interface ReportSummary {
    totalRevenue: number;
    totalBills: number;
    averageOccupancy: number;
    totalTenants: number;
    totalContracts: number;
    period: {
        from: string;
        to: string;
        months: number;
    };
}
export type ReportType = 'revenue' | 'occupancy' | 'tenants' | 'bills' | 'contracts' | 'custom';
export interface ReportRequest {
    type: ReportType;
    filters: ReportFilters;
    format?: 'json' | 'pdf' | 'excel';
    customFields?: string[];
}
export interface ReportResponse<T = any> {
    success: boolean;
    data: {
        type: ReportType;
        filters: ReportFilters;
        summary: ReportSummary;
        reportData: T[];
        generatedAt: Date;
        totalRecords: number;
    };
    error?: string;
}
export interface ExportOptions {
    filename?: string;
    title?: string;
    includeCharts?: boolean;
    includeDetails?: boolean;
    format: 'pdf' | 'excel';
}
export interface CustomReportField {
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'currency' | 'percentage';
    source: 'rooms' | 'tenants' | 'contracts' | 'bills' | 'meter_readings';
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}
export interface CustomReportConfig {
    name: string;
    description?: string;
    fields: CustomReportField[];
    filters: ReportFilters;
    groupBy?: string[];
    sortBy?: {
        field: string;
        direction: 'asc' | 'desc';
    }[];
}
export type DateRangePreset = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'last_year' | 'custom';
export interface DateRangeOption {
    label: string;
    value: DateRangePreset;
    getDateRange: () => DateRange;
}
//# sourceMappingURL=reports.d.ts.map