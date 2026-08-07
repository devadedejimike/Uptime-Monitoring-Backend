import { get } from "axios";
import { ErrorType, MonitorResult, MonitorTarget } from "./types"

// Convert Axios errors into monitoring error types
const classifyErrors = (error: any): ErrorType => {
        if(error.code === "ECONNABORTED"){ 
        return "TIMEOUT";
    }
    if(error.code === "ENOTFOUND"){ 
        return "DNS_FAILURE";
    }
    if(error.code === "ECONNREFUSED"){ 
        return "CONNECTION_REFUSED";
    }
    if(error.response){ 
        return "HTTP_ERROR";
    }
    if(error.request){ 
        return "NETWORK_ERROR";
    }

    return "UNKNOWN_ERROR"
}

// Check a single website and return the monitoring result
export const checkWebsite = async (website: MonitorTarget): Promise<MonitorResult> => {
    // Start timing the request
    const startTime = Date.now();

    try {
        const response = await get(website.url, {
            timeout: 10000,
            validateStatus: () => true
        })

        const responseTime = Date.now() - startTime;
        // Website responded with an error status
        if (response.status >= 400){
            return{
                websiteId: website.id,
                status: "DOWN",
                responseTime,
                httpStatus: response.status,
                errorType: "HTTP_ERROR",
                checkedAt: new Date()
            }
        }
        // Website is reachable
        return{
            websiteId: website.id,
            status: "UP",
            responseTime,
            httpStatus: response.status,
            checkedAt: new Date()
        }
    } catch (error: any) {
        const responseTime = Date.now() - startTime;
        // Request failed before a valid response was received
        return{
            websiteId: website.id,
            status: "DOWN",
            responseTime,
            errorType: classifyErrors(error),
            checkedAt: new Date()
        }
    }

}