import type { Flag } from "./flag"

export default class Constraint {
    id!: string

    description!: string

    key!: string

    values: string[] = []

    flags!: Flag[]
}