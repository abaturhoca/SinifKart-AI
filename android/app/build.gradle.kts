plugins {
    id("com.android.application") version "8.7.3"
    id("org.jetbrains.kotlin.android") version "2.0.21"
}
android {
    namespace = "org.sinifkart.scanner"
    compileSdk = 35
    defaultConfig {
        applicationId = "org.sinifkart.scanner"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "0.1"
    }
}
dependencies {
    implementation("org.opencv:opencv:4.12.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.camera:camera-camera2:1.4.2")
    implementation("androidx.camera:camera-lifecycle:1.4.2")
    implementation("androidx.camera:camera-view:1.4.2")
}
