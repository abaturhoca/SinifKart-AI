# Teknoloji kararı
MVP'de yönetim için React, TypeScript, Vite ve IndexedDB seçildi. Yerel ağ keşfi ve eşzamanlama yerine ilk prototipte JSON dosyası kullanılır. Web uygulaması ileride servis işçisiyle kendi sürümüyle uyumlu model ve WASM dosyalarını birlikte önbelleğe almalıdır.

|Ölçüt|Web PWA|Kotlin, CameraX ve OpenCV|
|---|---|---|
|Doğruluk ve çoklu kart|Aynı etiketli karelerde H6 ölçümü gerekir.|Aynı kareler ve sözlükle H5 ölçümü gerekir.|
|Cihaz uyumu|Kamera izni, güvenli köken ve tarayıcı sürümü etkiler.|Android API ve işlemci mimarisi sınırlar.|
|Çevrimdışı kullanım|İlk yüklemede uygulama dosyalarının önbelleğe alınması gerekir.|APK içinde yerel kütüphane ve SQLite bulunabilir.|
|Pil ve bellek|Worker ile arayüz yükü ayrılabilir. Cihazda ölçüm bekliyor.|CameraX kare kuyruğunu sınırlayabilir. Cihazda ölçüm bekliyor.|
|Bakım|Tek panel kod tabanı, her tarayıcı için kamera testi.|Ayrı dağıtım, SDK ve cihaz testleri.|

H6 kararından önce web kamerası birincil motor olarak seçilmez. Gerçek OpenCV.js örneğinde ArUco kurucusu ve algılama çağrısı çalıştırılmadan özellik etkinleştirilmez. Yerel Android adayı Maven Central'daki org.opencv:opencv:4.14.0 sürümüdür. Depo kaydı ve derleme sonucu ayrı kanıtlardır.

Kaynak: https://central.sonatype.com/artifact/org.opencv/opencv/4.14.0
