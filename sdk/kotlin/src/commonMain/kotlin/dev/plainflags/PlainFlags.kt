package dev.plainflags

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * PlainFlags client. With the default manual update policy ([PlainFlagsConfig.pollIntervalMs] = 0),
 * call [updateState] whenever you want the latest flag states. With a non-zero poll interval,
 * [init] starts polling the states service at that interval; call [stopUpdates] to stop polling.
 *
 * Constraint evaluation is not supported yet: [isOn] simply reflects the flag's on/off state
 * as returned by the service.
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
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var pollingJob: Job? = null

    suspend fun init() {
        if (config.pollIntervalMs == 0L) {
            if (updateState()) {
                info("Flags state initialized")
                info(flags.toString())
            }
            return
        }

        startPolling()
    }

    private suspend fun startPolling() {
        updateState()

        pollingJob = scope.launch {
            while (isActive) {
                delay(config.pollIntervalMs)
                updateState()
            }
        }
    }

    /** Stops polling for updates. Has no effect with the manual update policy. */
    fun stopUpdates() {
        pollingJob?.cancel()
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
