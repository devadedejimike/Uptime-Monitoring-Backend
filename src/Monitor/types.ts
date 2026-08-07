// Possible monitoring states
export type MonitorStatus = 'UP' | 'DOWN';

// Types of failures that can occur during a check
export type ErrorType = 
    | "TIMEOUT"
    | "DNS_FAILURE"
    | "SSL_CONNECTION"
    | "CONNECTION_REFUSED"
    | "HTTP_ERROR"
    | "NETWORK_ERROR"
    | "UNKNOWN_ERROR"

// Result returned after checking a website
export interface MonitorResult{
    websiteId: number;
    status: MonitorStatus;
    responseTime: number;
    httpStatus?: number;
    errorType?: ErrorType;
    checkedAt: Date
}

// Minimum information needed to monitor a website
export interface MonitorTarget{
    id: number,
    url: string
}

// 
export interface WebsiteMonitoringState {
    last_status: MonitorStatus | null;
    consecutive_failures: number;
    consecutive_success: number;
    incident_active: boolean;
    user_id: number;
    url: string
}

export type IncidentEvent = "DOWN" | "RECOVERY";

export interface HandleIncidentEventProps {
    userId: number;
    websiteId: number;
    websiteUrl: string;
    event: IncidentEvent
}