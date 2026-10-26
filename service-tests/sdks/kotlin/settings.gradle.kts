rootProject.name = "plain-flags-kotlin-sdk-test"

includeBuild("../../../sdk/kotlin") {
    dependencySubstitution {
        substitute(module("dev.plainflags:plain-flags-kotlin-sdk-jvm")).using(project(":"))
    }
}
