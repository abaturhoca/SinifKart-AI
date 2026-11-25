# SınıfKart AI · v30 yazılım raporu · 24 Kasım 2026

Drive ve Library'deki en güncel v29 ZIP SHA-256 `9906aa05310c7967dda082cae85660e7aa8b94a695137dd355fda408c8db6467` ile birebir aynı; rapor metinleri de aynı. v29 temel alındı. Soru bankası 120 soru, SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: Web panelinde rapor okunurken oturum, sınıf, soru veya yanıt değişirse bekleyen eski IndexedDB okumasının raporu ekrana yazması engellendi. Birden çok rapor isteğinde yalnız en son isteğin sonucu kullanılabiliyor. Böylece eski oturumun öğrenci tablosunun yeni oturum etiketiyle indirilmesi riski azaltıldı.

Test: Yeni `test-request-gate.mjs` geçersiz ve güncel rapor isteklerini doğruladı. `test-report` 40×6 örneği, `test-indexeddb`, oturum, Android köprüsü, liste, kart eşleştirme ve sentetik yön testleri geçti. `npm run build` ve `npm run test:offline` geçti; güncel `web/dist` ve `sw.js` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` tarayıcı uyumluluk uyarıları sürüyor. Gerçek tarayıcıda indirme/yazdırma ve çevrimdışı yeniden açma bu ortamda doğrulanamadı; yerel sunucuya ayrı oturumdan erişim reddedildi, Chromium işlem soketi açamadı. Android APK, P580, kamera ve basılı kart testleri yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

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
| Ana 8 | Kısmi | Gecikmiş rapor sonucu koruması ve canlı oturum kod/testi geçti; gerçek cihaz açık. |
| Ana 9 | Kısmi | Çevrimdışı önbellek/yedek testleri geçti; gerçek tarayıcı açık. |
| Ana 10 | Kısmi | Çapraz biçim 40×6 örneği ve rapor yarış koruması geçti; gerçek tarayıcı/PDF/uzun dönem açık. |
| Ana 11 | Kısmi | Yerel model/öğretmen kabulü; soru üretimi durduruldu. |
| Ana 12 | Kısmi | Gizlilik ve erişilebilirlik denetimi. |
| Ana 13 | Kısmi | Android/Pardus ve fiziksel pilot. |
| H1 | Kısmi | Web derlemesi geçti; Android APK açık. |
| H2 | Kısmi | Sentetik kapı geçti; basılı kart açık. |
| H3 | Kısmi | Sentetik kapı geçti; gerçek kamera açık. |
| H4 | Kısmi | Yanıt/soru/sınıf uyuşmazlığı reddi geçti; gerçek tarayıcı/kamera açık. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android APK ve cihaz testi. |
| H7 | Kısmi | 40×5 Node testi geçti; tarayıcı/fiziksel sınıf açık. |
| HK | Açık | Bağımsız son kabul denetimi. |

Sonraki iş: gerçek tarayıcı erişebilen ortamda rapor indirme/yazdırma, oturum değiştirme ve çevrimdışı yeniden açma; SDK/Gradle ortamında APK derleme.
