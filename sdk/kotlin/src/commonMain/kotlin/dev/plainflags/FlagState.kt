package dev.plainflags

import kotlinx.serialization.Serializable

@Serializable
data class Constraint(
    val key: String,
    val values: List<String> = emptyList(),
)

@Serializable
data class FlagState(
    val isOn: Boolean = false,
    val constraints: List<Constraint> = emptyList(),
)

typealias FlagStates = Map<String, FlagState>
