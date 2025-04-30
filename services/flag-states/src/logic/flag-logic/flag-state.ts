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

class Cache {
    static data: any
    static lastUpdated: number = 0

    static valid(): boolean {
        if (!process.env.CACHE_TTL) {
            return false
        }

        if (!this.data) {
            return false
        }

        return (Date.now() - this.lastUpdated) < +(process.env.CACHE_TTL || 0)
    }

    static get() {
        return this.data
    }

    static set(data: any) {
        this.data = data
        this.lastUpdated = Date.now()
    }
}

export async function latestFlagState() {
    if (Cache.valid()) {
        return Cache.get()
    }

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

    Cache.set(flagStates)

    return flagStates
}
