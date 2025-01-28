import type Constraint from "./constraint";

export interface Flag {
    id: string;

    name: string;

    isOn: boolean;

    stale: boolean;

    constraints: Constraint[];
}
