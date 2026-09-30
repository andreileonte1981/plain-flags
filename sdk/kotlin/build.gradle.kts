plugins {
    kotlin("multiplatform") version "2.0.21"
    kotlin("plugin.serialization") version "2.0.21"
    id("com.vanniktech.maven.publish") version "0.29.0"
}

group = "io.github.andreileonte1981"
version = "1.0.0"

repositories {
    mavenCentral()
}

kotlin {
    jvm {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11)
        }
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("io.ktor:ktor-client-core:2.3.12")
                implementation("io.ktor:ktor-client-content-negotiation:2.3.12")
                implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.12")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")
            }
        }

        val commonTest by getting {
            dependencies {
                implementation(kotlin("test"))
            }
        }

        val jvmMain by getting {
            dependencies {
                implementation("io.ktor:ktor-client-cio:2.3.12")
            }
        }
    }
}

mavenPublishing {
    coordinates("io.github.andreileonte1981", "plain-flags-kotlin-sdk", version.toString())

    pom {
        name.set("Plain Flags Kotlin SDK")
        description.set("Kotlin SDK for the Plain Flags free feature flags system.")
        url.set("https://plainflags.dev")

        licenses {
            license {
                name.set("MIT")
            }
        }

        developers {
            developer {
                id.set("andreileonte1981")
                name.set("Andrei Leonte")
            }
        }

        scm {
            url.set("https://github.com/andreileonte1981/plain-flags")
        }
    }
}
