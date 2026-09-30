package dev.plainflagstest

import java.util.UUID

fun saltUniqued(s: String): String = "${s}_${UUID.randomUUID()}"
