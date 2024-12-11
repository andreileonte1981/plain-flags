export default class Config {
    static serviceUrl() {
        return process.env.SERVICE_URL || "http:/127.0.0.1:5000"
    }
}