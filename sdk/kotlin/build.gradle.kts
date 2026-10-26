plugins {
    kotlin("multiplatform") version "2.4.21"
    kotlin("plugin.serialization") version "2.4.21"
    id("com.vanniktech.maven.publish") version "0.37.0"
    signing
}

group = "dev.plainflags"
version = "1.0.2"

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

signing {
    useGpgCmd()
    sign(publishing.publications)
}

mavenPublishing {
    coordinates("dev.plainflags", "plain-flags-kotlin-sdk", version.toString())
    
    publishToMavenCentral()
    signAllPublications()

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
            connection.set("scm:git:git://github.com/andreileonte1981/plain-flags.git")
            developerConnection.set("scm:git:ssh://github.com/andreileonte1981/plain-flags.git")
        }
    }
}
