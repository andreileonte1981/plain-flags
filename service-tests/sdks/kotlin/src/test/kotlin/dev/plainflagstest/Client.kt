package dev.plainflagstest

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement

class Response(val statusCode: Int, val body: JsonElement)

class Client {
    private val baseUrl = DotEnv.get("API_URL_MGT") ?: "http://localhost:5000"

    private val http = HttpClient {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
    }

    suspend fun post(endpoint: String, data: JsonElement, token: String? = null): Response {
        val response: HttpResponse = http.post("$baseUrl$endpoint") {
            contentType(ContentType.Application.Json)
            if (token != null) {
                header("Authorization", "Bearer $token")
            }
            setBody(data)
        }

        return Response(response.status.value, response.body())
    }
}
