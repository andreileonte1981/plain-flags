import Flag from "../../entities/flag"

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

export async function latestFlagState() {
    const all = await Flag.find(
        { where: { isArchived: false }, relations: ["constraints"] }
    )

    const flagStates: { [flagName: string]: FlagState } = {}

    for (const flag of all) {
        const constraints = flag.constraints.map(c => ({
            key: c.key, values: c.values
        }))
        flagStates[flag.name] = {
            isOn: flag.isOn,
            constraints
        }
    }

    return flagStates
}