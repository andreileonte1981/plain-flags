package dev.plainflags

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.HttpResponse
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

internal class Client(private val config: PlainFlagsConfig) {
    private val http = HttpClient {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
        install(HttpTimeout) {
            requestTimeoutMillis = config.timeoutMs
        }
    }

    suspend fun getFlagStates(): FlagStates {
        val response: HttpResponse = http.get("${config.serviceUrl}/api/sdk") {
            header("x-api-key", config.apiKey)
        }

        if (response.status.value != 200) {
            throw IllegalStateException("Error fetching flags state: ${response.status.value}")
        }

        return response.body()
    }
}
