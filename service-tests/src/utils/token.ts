import assert from "assert";
import { Client } from "../client/client";
import Salt from "./salt";

export async function tokenForLoggedInUser(
    client: Client
): Promise<string> {
    const email = `${Salt.uniqued("mruser")}@mail.com"`
    const password = "pass01";

    const registerResponse = await client.post("/api/users", { email, password });

    assert(registerResponse?.status === 201);

    const loginResponse: any = await client.post("api/users/login", { email, password})

    const token = loginResponse?.data?.token;

    return token || "";
}
