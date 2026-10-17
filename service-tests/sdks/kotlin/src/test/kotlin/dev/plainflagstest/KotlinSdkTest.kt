package dev.plainflagstest

import dev.plainflags.PlainFlags
import dev.plainflags.PlainFlagsConfig
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test

class KotlinSdkTest {
    companion object {
        @JvmStatic
        @BeforeAll
        fun setup() {
            DotEnv.init()
        }
    }

    @Test
    fun `turning on a flag shows it as on in the SDK after initialization`() =
        runBlocking {
            val client = Client()
            val token = userToken(client)
            val flagName = saltUniqued("tkt-o")

            val createResponse =
                client.post(
                    "/api/flags",
                    buildJsonObject { put("name", JsonPrimitive(flagName)) },
                    token,
                )
            assertEquals(201, createResponse.statusCode)
            val flagId =
                createResponse.body.jsonObject["id"]!!
                    .jsonPrimitive.content

            val turnOnResponse =
                client.post(
                    "/api/flags/turnon",
                    buildJsonObject { put("id", JsonPrimitive(flagId)) },
                    token,
                )
            assertEquals(200, turnOnResponse.statusCode)

            val featureFlags =
                PlainFlags(
                    config =
                        PlainFlagsConfig(
                            serviceUrl =
                                DotEnv.get("API_URL_STATES")
                                    ?: "http://localhost:5001",
                            apiKey = DotEnv.get("API_KEY") ?: "",
                        ),
                    infoCallback = null,
                    errorCallback = null,
                )

            delay(1200) // allow the states service cache to refresh

            featureFlags.init()

            assertTrue(featureFlags.isOn(flagName, false))
        }

    @Test
    fun `turning on a flag shows it as on in the SDK after a manual state update`() =
        runBlocking {
            val client = Client()
            val token = userToken(client)
            val flagName = saltUniqued("tkt-m")

            val createResponse =
                client.post(
                    "/api/flags",
                    buildJsonObject { put("name", JsonPrimitive(flagName)) },
                    token,
                )
            assertEquals(201, createResponse.statusCode)
            val flagId =
                createResponse.body.jsonObject["id"]!!
                    .jsonPrimitive.content

            val featureFlags =
                PlainFlags(
                    config =
                        PlainFlagsConfig(
                            serviceUrl =
                                DotEnv.get("API_URL_STATES")
                                    ?: "http://localhost:5001",
                            apiKey = DotEnv.get("API_KEY") ?: "",
                        ),
                    infoCallback = null,
                    errorCallback = null,
                )

            featureFlags.init()

            val turnOnResponse =
                client.post(
                    "/api/flags/turnon",
                    buildJsonObject { put("id", JsonPrimitive(flagId)) },
                    token,
                )
            assertEquals(200, turnOnResponse.statusCode)

            delay(1200) // allow the states service cache to refresh

            featureFlags.updateState()

            assertTrue(featureFlags.isOn(flagName, false))
        }

    @Test
    fun `the SDK polls for updates at the specified interval`() = runBlocking {
        val client = Client()
        val token = userToken(client)
        val flagName = saltUniqued("tkt-p")

        val createResponse = client.post(
            "/api/flags",
            buildJsonObject { put("name", JsonPrimitive(flagName)) },
            token,
        )
        assertEquals(201, createResponse.statusCode)
        val flagId = createResponse.body.jsonObject["id"]!!.jsonPrimitive.content

        val featureFlags = PlainFlags(
            config = PlainFlagsConfig(
                serviceUrl = DotEnv.get("API_URL_STATES") ?: "http://localhost:5001",
                apiKey = DotEnv.get("API_KEY") ?: "",
                pollIntervalMs = 1000,
            ),
            infoCallback = null,
            errorCallback = null,
        )

        featureFlags.init()

        delay(200)

        assertFalse(featureFlags.isOn(flagName, false))

        val turnOnResponse = client.post(
            "/api/flags/turnon",
            buildJsonObject { put("id", JsonPrimitive(flagId)) },
            token,
        )
        assertEquals(200, turnOnResponse.statusCode)

        delay(1200) // allow a poll cycle and the states service cache to refresh

        assertTrue(featureFlags.isOn(flagName, false))

        val turnOffResponse = client.post(
            "/api/flags/turnoff",
            buildJsonObject { put("id", JsonPrimitive(flagId)) },
            token,
        )
        assertEquals(200, turnOffResponse.statusCode)

        delay(1200)

        assertFalse(featureFlags.isOn(flagName, false))
    }
}

