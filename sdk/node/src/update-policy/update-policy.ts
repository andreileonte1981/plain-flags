
interface IStateUpdateConfig {
    readonly policy: "manual" | "poll"
}

/**
 * The application has to call updateState to get
 * the latest feature state. It is also obtained by default at initialization
 */
export interface ManualStateUpdateConfig extends IStateUpdateConfig {
    readonly policy: "manual"
    readonly serviceUrl: string

    /**
     * Defaults to 2000 ms
     */
    readonly timeout?: number
    readonly apiKey: string
}

/**
 * The application will regularly poll the state service
 * for the latest feature state
 */
export interface PollStateUpdateConfig extends IStateUpdateConfig {
    readonly policy: "poll"
    readonly serviceUrl: string

    /**
     * Timeout for each polling request. Defaults to 2000 ms
     */
    readonly timeout?: number

    /**
     * In milliseconds
     */
    readonly pollInterval: number
    readonly apiKey: string
}

export type StateUpdateConfig = ManualStateUpdateConfig | PollStateUpdateConfig
