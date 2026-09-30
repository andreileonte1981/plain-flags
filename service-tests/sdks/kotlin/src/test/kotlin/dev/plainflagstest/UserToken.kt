package dev.plainflagstest

import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

suspend fun userToken(client: Client): String {
    val userEmail = "${saltUniqued("kotlinuser")}@mail.com"
    val password = "pass01"

    client.post(
        "/api/users",
        buildJsonObject {
            put("email", JsonPrimitive(userEmail))
            put("password", JsonPrimitive(password))
        },
    )

    val loginResponse = client.post(
        "/api/users/login",
        buildJsonObject {
            put("email", JsonPrimitive(userEmail))
            put("password", JsonPrimitive(password))
        },
    )

    return loginResponse.body.jsonObject["token"]!!.jsonPrimitive.content
}
