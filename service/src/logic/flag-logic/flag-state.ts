/**
 * Sync with same type in sdk
 */
export type FlagState = {
    isOn: boolean
    constraints: {
        key: string
        values: string[]
    }[]
}