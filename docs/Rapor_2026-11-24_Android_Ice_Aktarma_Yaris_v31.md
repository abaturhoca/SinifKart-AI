# SınıfKart AI · v31 yazılım raporu · 24 Kasım 2026

Drive ve Library'deki en güncel v30 kaynak ZIP SHA-256 `3b4c06dbde3c6e5a23bd3308f89da2204912262c3914559ca3b9416fcf2dd016` ile birebir aynı; rapor metinleri de eşleşti. v30 temel alındı. Soru bankası 120 soru, SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: Android yanıt dosyası asenkron okunup doğrulanırken etkin oturum, soru veya sınıf değişmişse IndexedDB yazısı öncesinde işlem reddediliyor. Böylece eski bağlamda başlamış içe aktarma sonradan yanıt kaydedemiyor. Geçerli bağlamda normal içe aktarma korunuyor.

Test: Yeni kontrollü gecikme testi, bağlam değişince yazma çağrısının 0 olduğunu ve geçerli bağlamda 1 kez çağrıldığını doğruladı. Rapor, IndexedDB, oturum, liste, kart eşleştirme ve 400/400 sentetik yön testleri geçti. `npm run build` (TypeScript + Vite + güncel servis çalışanı) ve `npm run test:offline` geçti; güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` tarayıcı uyumluluk uyarıları sürüyor. Gerçek tarayıcıda indirme/yazdırma, Android dosya aktarımı ve çevrimdışı yeniden açma doğrulanamadı; önceki denemede Chromium soket kısıtına takıldı. Android APK, P580, kamera ve basılı kart testleri yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android APK ve P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Oturum bazlı sınıf ayrımı Node testinde geçti; tarayıcı/cihaz açık. |
| Ana 7 | Kısmi | 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Canlı oturum ve gecikmiş Android içe aktarma reddi Node testinde geçti; gerçek cihaz açık. |
| Ana 9 | Kısmi | Çevrimdışı önbellek/yedek testleri geçti; gerçek tarayıcı açık. |
| Ana 10 | Kısmi | Çapraz biçim 40×6 örneği ve rapor yarış koruması geçti; gerçek tarayıcı/PDF/uzun dönem açık. |
| Ana 11 | Kısmi | Yerel model/öğretmen kabulü; soru üretimi durduruldu. |
| Ana 12 | Kısmi | Gizlilik ve erişilebilirlik denetimi. |
| Ana 13 | Kısmi | Android/Pardus ve fiziksel pilot. |
| H1 | Kısmi | Web derlemesi geçti; Android APK açık. |
| H2 | Kısmi | Sentetik kapı geçti; basılı kart açık. |
| H3 | Kısmi | Sentetik kapı geçti; gerçek kamera açık. |
| H4 | Kısmi | Yanıt/soru/sınıf uyuşmazlığı ve gecikmiş Android içe aktarma reddi geçti; gerçek tarayıcı/kamera açık. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android APK ve cihaz testi. |
| H7 | Kısmi | 40×5 Node testi geçti; tarayıcı/fiziksel sınıf açık. |
| HK | Açık | Bağımsız son kabul denetimi. |

Sonraki iş: gerçek tarayıcı erişebilen ortamda Android dosya içe aktarma ile rapor indirme/yazdırma ve çevrimdışı yeniden açma; SDK/Gradle ortamında APK derleme.
