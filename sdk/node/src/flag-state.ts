/**
 * Sync with same type in service.
 */
export type FlagState = {
    isOn: boolean

    constraints: {
        key: string
        values: string[]
    }[]
}
