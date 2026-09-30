package dev.plainflags

/**
 * PlainFlags client for the manual update policy: call [updateState] whenever you
 * want the latest flag states. [init] performs one initial fetch.
 *
 * This first draft does not support constraint evaluation or polling: [isOn]
 * simply reflects the flag's on/off state as returned by the service.
 *
 * @param config configuration for the PlainFlags instance.
 * @param infoCallback callback for regular logs (default: println). Pass null to mute.
 * @param errorCallback callback for error logs (default: println). Pass null to mute.
 */
class PlainFlags(
    private val config: PlainFlagsConfig,
    private var infoCallback: ((String) -> Unit)? = { println(it) },
    private var errorCallback: ((String) -> Unit)? = { println(it) },
) {
    private var flags: FlagStates = emptyMap()
    private val client = Client(config)

    suspend fun init() {
        if (updateState()) {
            info("Flags state initialized")
            info(flags.toString())
        }
    }

    /** Updates the flag states from the plain flags states service. Returns true on success. */
    suspend fun updateState(): Boolean {
        return try {
            flags = client.getFlagStates()
            true
        } catch (e: Exception) {
            error("Error updating flags state: ${e.message}")
            false
        }
    }

    /**
     * Checks if a feature flag is enabled.
     *
     * @param flagName the name of the feature flag.
     * @param defaultValue the default value to return if the flag is not found.
     */
    fun isOn(flagName: String, defaultValue: Boolean = false): Boolean {
        return try {
            val flag = flags[flagName]

            if (flag == null) {
                error("Flag name $flagName not in local cache")
                return defaultValue
            }

            flag.isOn
        } catch (e: Exception) {
            error("Flag name $flagName state query failed: ${e.message}")
            defaultValue
        }
    }

    /** Gets the current flag states. */
    fun getCurrentStates(): FlagStates = flags

    /**
     * Sets the current flag states.
     *
     * It is good practice to obtain the feature flag states on your server side, then securely
     * send them to your client app. This way you can avoid exposing your Plain Flags API key
     * in the client app.
     */
    fun setCurrentStates(newStates: FlagStates) {
        flags = newStates
    }

    fun setInfoCallback(callback: ((String) -> Unit)?) {
        infoCallback = callback
    }

    fun setErrorCallback(callback: ((String) -> Unit)?) {
        errorCallback = callback
    }

    private fun info(message: String) {
        infoCallback?.invoke(message)
    }

    private fun error(message: String) {
        errorCallback?.invoke(message)
    }
}
