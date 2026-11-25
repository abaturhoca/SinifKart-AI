# SınıfKart AI · v20 yazılım raporu · 24 Kasım 2026

Kaynak: Drive PLİCKERS v19 ZIP ve Library v19 ZIP SHA-256 `527de4f757786752c8c17b90769db34fab390983e63818e6e09e8f89a8e0b27f` ile aynı; v19 raporları da karşılaştırıldı. Daha yeni paket bulunmadı. Soru bankası 120 soru ve SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444` olarak aynen korundu. Yeni soru eklenmedi.

Yapılan iş: v19 web kaynakları `npm ci` ardından TypeScript ve Vite ile üretim için yeniden derlendi. ZIP'e güncel `web/dist` kondu. `fake-indexeddb` geliştirme bağımlılığı ve `test-indexeddb.mjs` eklendi. Test oturum anahtarının, cevapların ve soru açıldığı andaki sınıf snapshot'ının veritabanı yeniden açılınca korunmasını; tekrar yanıtın çoğalmamasını; çelişen yanıtın ve farklı sınıfla aynı sorunun reddini doğruluyor.

Doğrulama: `test-indexeddb`, `test-session`, `test-report` (40 öğrenci × 5 soru, 200 kayıt), `test-android-bridge`, `test-roster`, `test-reconcile`, `test-scan` (400/400 sentetik yön) ve `npm run build` geçti. `web/dist/index.html` güncel `index-D4ugrSJ4.js` varlığıyla doğrulandı. OpenCV tarayıcı uyumluluğu ve 15,5 MB parça uyarıları sürüyor. Chromium bu ortamda işlem soketi açamadığı için gerçek tarayıcı yeniden başlatma testi yapılamadı; Android SDK/Gradle olmadığı için APK derlenmedi. Kamera, P580 ve basılı kart deneyleri yapılmadı. Kaynak ZIP kişisel öğrenci verisi içermez.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android APK derleme ve P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera görüntüsü ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Çoklu sınıfın tarayıcı ve gerçek cihaz kabulü. |
| Ana 7 | Kısmi | Mevcut 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Üretim derlemesi geçti; tarayıcıda yeniden açma ve cihaz eşlemesi açık. |
| Ana 9 | Kısmi | Gerçek tarayıcıda çevrimdışı yeniden başlatma ve geri yükleme. |
| Ana 10 | Kısmi | 40×5 Node raporu geçti; tarayıcı ve uzun dönem rapor kabulü açık. |
| Ana 11 | Kısmi | Yerel model/öğretmen kabulü; soru üretimi durduruldu. |
| Ana 12 | Kısmi | Gizlilik ve erişilebilirlik denetimi. |
| Ana 13 | Kısmi | Android/Pardus ve fiziksel pilot. |
| H1 | Kısmi | Web üretim derlemesi geçti; Android APK açık. |
| H2 | Kısmi | Sentetik kapı geçti; basılı kart açık. |
| H3 | Kısmi | Sentetik kapı geçti; gerçek kamera açık. |
| H4 | Kısmi | IndexedDB işlemleri otomatik testte geçti; gerçek tarayıcı ve kamera açık. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android APK ve cihaz testi. |
| H7 | Kısmi | 40×5 Node testi geçti; tarayıcı ve fiziksel sınıf deneyi açık. |
| HK | Açık | Bağımsız son kabul denetimi. |

Sonraki yazılım işi: gerçek tarayıcı çalışabilen ortamda üretim paneli ve IndexedDB yenileme testi; ardından Android APK derlemesi.
