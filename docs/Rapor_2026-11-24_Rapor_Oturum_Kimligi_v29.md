# SınıfKart AI · v29 yazılım raporu · 24 Kasım 2026

Drive ve Library'deki en güncel v28 ZIP SHA-256 `9fa45d4723424085be889dea5aa929cd8f38017696786096b3b3839a23f0bf31` ile birebir aynı; v28 raporu okundu. v28 temel alındı. Soru bankası 120 soru, SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: v28'in web kaynakları `npm ci` ardından TypeScript, Vite ve service worker ile yeniden derlendi. ZIP'deki eski v27 `web/dist` yenilendi; yazdırılabilir rapor düğmesi üretim derlemesinde var. Öğrenci CSV, soru CSV ve yazdırılabilir HTML dosya adları oturumun UTC zaman damgasını taşıyor; HTML içindeki oturum kimliği güvenli biçimde yazılıyor. Bu, farklı oturumlardan indirilen raporların karışma riskini azaltıyor. Raporun 40 kurgusal öğrenci × altı soru çapraz biçim eşleştirmesi v28'den korunuyor.

Doğrulama: `test-report` oturumlu dosya adını ve HTML kaçışını, 200 yanıt/50 doğru/altıncı boş soruyu doğruladı. Diğer altı Node testi, `npm run build` ve `npm run test:offline` geçti. OpenCV 15,5 MB paket ve `fs`/`crypto` tarayıcı uyumluluk uyarıları sürüyor. Gerçek tarayıcıda indirme/yazdırma, çevrimdışı yeniden açma, Android APK, P580, kamera ve basılı kart testleri yapılmadı. Yazdırılabilir HTML doğrudan PDF dosyası değildir. Kaynak ZIP gerçek öğrenci verisi içermez.

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
| Ana 8 | Kısmi | Canlı oturum kod/testi geçti; cihaz açık. |
| Ana 9 | Kısmi | Çevrimdışı önbellek/yedek testleri geçti; gerçek tarayıcı açık. |
| Ana 10 | Kısmi | Çapraz biçim 40×6 örnek eşleştirme ve güncel web derlemesi geçti; gerçek tarayıcı indirme/PDF ve uzun dönem kabulü açık. |
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

Sonraki iş: gerçek tarayıcıda rapor indirme/yazdırma ve çevrimdışı yeniden açma; Android SDK/Gradle ortamında APK derleme.
