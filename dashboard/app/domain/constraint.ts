export default class Constraint {
    id!: string

    description!: string

    key!: string

    values: string[] = []

    flags!: string[]
}