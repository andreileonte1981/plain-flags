
interface IStateUpdateConfig {
    readonly policy: "manual" | "poll" | "ws"
}

/**
 * The application has to call updateState to get
 * the latest feature state. It is also obtained by default at initialization
 */
export interface ManualStateUpdateConfig extends IStateUpdateConfig {
    readonly policy: "manual"
    readonly serviceUrl: string
    readonly apiKey: string
}

/**
 * The application will regularly poll the state service
 * for the latest feature state
 */
export interface PollStateUpdateConfig extends IStateUpdateConfig {
    readonly policy: "poll"
    readonly serviceUrl: string
    readonly pollInterval: number
    readonly apiKey: string
}

/**
 * A resilient web socket connection will allow
 * the state service to send up-to-date feature state
 * every time it changes
 * 
 * With this policy, you should call stopUpdates when your application finishes execution.
 */
export interface SocketStateUpdateConfig extends IStateUpdateConfig {
    readonly policy: "ws"
    readonly serviceUrl: string
}

export type StateUpdateConfig = ManualStateUpdateConfig | PollStateUpdateConfig | SocketStateUpdateConfig