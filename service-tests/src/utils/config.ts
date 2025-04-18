export default class Config {
    static stateServiceUrl() {
        return process.env.STATE_SERVICE_URL || "http:/127.0.0.1:5001"
    }

    static stateServiceWs() {
        return process.env.STATE_SERVICE_WS || "ws://localhost:8081"
    }

    static managementServiceUrl() {
        return process.env.MANAGEMENT_SERVICE_URL || "http:/127.0.0.1:5000"
    }
}