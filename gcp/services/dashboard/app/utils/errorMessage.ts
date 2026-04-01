export function extractErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        const data = (e.response as Record<string, unknown> | undefined)?.data;
        if (data && typeof data === "object") {
            const d = data as Record<string, unknown>;
            if (typeof d.message === "string") return d.message;
            if (typeof d.error === "string") return d.error;
        }
    }
    return err instanceof Error ? err.message : fallback;
}
