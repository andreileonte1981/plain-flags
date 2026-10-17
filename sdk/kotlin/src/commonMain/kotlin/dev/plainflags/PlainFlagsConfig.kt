package dev.plainflags

/**
 * Configuration for PlainFlags.
 *
 * @param serviceUrl URL of the PlainFlags states service. Example: https://flags.mydomain.com
 * @param apiKey API key for authenticating with the PlainFlags service, as configured on the back end.
 * @param timeoutMs Request timeout in milliseconds (default: 20000).
 * @param pollIntervalMs Interval for polling flag states from the server. 0 disables polling
 * (default: 0); you can still update flag state manually. Not yet implemented.
 */
data class PlainFlagsConfig(
    val serviceUrl: String,
    val apiKey: String = "",
    val timeoutMs: Long = 20000,
    val pollIntervalMs: Long = 0,
)
