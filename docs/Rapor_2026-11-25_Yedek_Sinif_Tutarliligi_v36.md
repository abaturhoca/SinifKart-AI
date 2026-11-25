# SınıfKart AI · v36 yazılım raporu · 25 Kasım 2026

Drive ve Library'deki en güncel v35 ZIP SHA-256 `57b0517019cdc6159573896384bcd8a74b72f0fdaa4a17eb44ad423bd0a6f0a5` ile birebir aynı; raporlar da SHA-256 `d66869623e4519af5b2151a07a03a95863b2c4a5d196788a03d9003a41578144` ile aynı. v35 temel alındı. 120 soruluk banka SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: Yerel tam yedek geri yüklenmeden önce aynı oturumun soru snapshot'larında farklı sınıf listeleri bulunması ve etkin oturumun sınıf listesinin yedekteki etkin sınıfla uyuşmaması reddediliyor. Böylece içe aktarılmış bozuk yedek sonradan sınıf seçimini veya raporu tutarsız hale getirmiyor.

Test: `test-indexeddb.mjs` iki bozuk yedeği reddetti; geçerli tam yedeğin geri yüklenmesi sürdü. Oturum, Android köprüsü, rapor 40×5, liste, kart eşleştirme ve 400/400 sentetik yön testleri geçti. `npm run build` (TypeScript + Vite + güncel servis çalışanı) ve `npm run test:offline` geçti; güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` uyarıları sürüyor. Gerçek tarayıcıda çevrimdışı yeniden açma, yedek geri yükleme ve indirme/yazdırma; Android APK, P580, kamera ve basılı kart kabulü yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android APK ve P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Oturum bazlı sınıf ayrımı, atomik içe aktarma ve yedek sınıf tutarlılığı Node testinde geçti; tarayıcı/cihaz açık. |
| Ana 7 | Kısmi | 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Canlı oturumda soru seçimi ve yanıt yazımı atomik bağlam doğrulamasıyla Node testinde geçti; gerçek cihaz açık. |
| Ana 9 | Kısmi | Çevrimdışı önbellek, ağ geri dönüşü ve çelişkili sınıf yedeği reddi geçti; gerçek tarayıcı açık. |
| Ana 10 | Kısmi | Çapraz biçim 40×6 örneği ve rapor yarış koruması geçti; gerçek tarayıcı/PDF/uzun dönem açık. |
| Ana 11 | Kısmi | Yerel model/öğretmen kabulü; soru üretimi durduruldu. |
| Ana 12 | Kısmi | Gizlilik ve erişilebilirlik denetimi. |
| Ana 13 | Kısmi | Android/Pardus ve fiziksel pilot. |
| H1 | Kısmi | Web derlemesi geçti; Android APK açık. |
| H2 | Kısmi | Sentetik kapı geçti; basılı kart açık. |
| H3 | Kısmi | Sentetik kapı geçti; gerçek kamera açık. |
| H4 | Kısmi | Yanıt yazımında etkin oturum, soru kaydı ve öğrenci-kart eşleşmesi tek IndexedDB işleminde doğrulandı; gerçek tarayıcı/kamera açık. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android APK ve cihaz testi. |
| H7 | Kısmi | 40×5 Node testi geçti; tarayıcı/fiziksel sınıf açık. |
| HK | Açık | Bağımsız son kabul denetimi. |

Sonraki iş: gerçek tarayıcıda çevrimdışı yeniden açma, yedek geri yükleme ve rapor indirme/yazdırma; SDK/Gradle ortamında APK derleme.
