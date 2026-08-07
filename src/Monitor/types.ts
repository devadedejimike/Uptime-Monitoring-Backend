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