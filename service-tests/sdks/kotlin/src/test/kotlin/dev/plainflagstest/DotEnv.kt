package dev.plainflagstest

import java.io.File

object DotEnv {
    private val env = mutableMapOf<String, String>()
    private var loaded = false

    fun init() {
        if (loaded) return
        loaded = true

        val file = File(".env")
        if (!file.exists()) return

        for (line in file.readLines()) {
            val trimmed = line.trim()
            if (trimmed.isEmpty() || trimmed.startsWith("#")) continue

            val parts = trimmed.split("=", limit = 2)
            if (parts.size == 2) {
                env[parts[0].trim()] = parts[1].trim()
            }
        }
    }

    fun get(key: String): String? = env[key]?.ifEmpty { null } ?: System.getenv(key)
}
