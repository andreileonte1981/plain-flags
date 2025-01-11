export interface Flag {
    id: string;
    name: string;
    isOn: boolean;
    stale: boolean;
    constraints: string[];
}
