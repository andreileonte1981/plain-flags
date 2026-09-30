rootProject.name = "plain-flags-kotlin-sdk-test"

includeBuild("../../../sdk/kotlin") {
    dependencySubstitution {
        substitute(module("io.github.andreileonte1981:plain-flags-kotlin-sdk-jvm")).using(project(":"))
    }
}
