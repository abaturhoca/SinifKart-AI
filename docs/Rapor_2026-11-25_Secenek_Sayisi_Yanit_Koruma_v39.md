# SınıfKart AI · v39 yazılım raporu · 25 Kasım 2026

Drive ve Library'deki en güncel v38 ZIP SHA-256 `d24f8e6412131ce5e41901387580ed7aea7c9239e1f7fe216bab9ceef5b8007b` ile birebir aynı; raporlar da SHA-256 `704f6d33741060c3970d84688fcff4e3fa1579527f1f26fa95ecdb66da1d047a` ile aynı. v38 temel alındı. 120 soruluk banka SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: Yeni soru snapshot'ları seçenek sayısını da saklıyor. Yanıt yazımı ve yerel yedek doğrulaması, iki/üç seçenekli sorularda dışarıdaki şıkları reddediyor. Eski snapshot'larda bu alan yoksa soru metni/anahtarı aynı kaldığında yeniden açılmasına izin veriliyor; eski veriye yeni seçenek sayısı tahmin edilerek yazılmıyor.

Test: İki seçenekli kurgusal soruda D reddedildi, B kaydedildi; bozuk yedekte D reddedildi. Eski metadata ile kayıtlı sorunun seçenek sayısı alanıyla yeniden açılması geçti. IndexedDB, oturum, Android köprüsü, rapor 40×5, liste, kart eşleştirme ve 400/400 sentetik yön testleri geçti. `npm run build` (TypeScript + Vite + güncel servis çalışanı) ve `npm run test:offline` geçti; güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` uyarıları sürüyor. Gerçek tarayıcı, Android APK, P580, kamera ve basılı kart kabulü yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android APK ve P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Oturum bazlı sınıf ayrımı, atomik içe aktarma ve eski yanıtların sınıf eşleşmesi Node testinde geçti; tarayıcı/cihaz açık. |
| Ana 7 | Kısmi | 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Canlı oturumda Android oturum dosyası dışa aktarımı ve yanıt içe aktarımı bağlam değişikliğinde reddedildi; gerçek cihaz açık. |
| Ana 9 | Kısmi | Çevrimdışı önbellek, yedek tutarlılığı ve eski yanıt-kart eşleşmesi geçti; gerçek tarayıcı açık. |
| Ana 10 | Kısmi | Çapraz biçim 40×6 örneği ve rapor yarış koruması geçti; gerçek tarayıcı/PDF/uzun dönem açık. |
| Ana 11 | Kısmi | Yerel model/öğretmen kabulü; soru üretimi durduruldu. |
| Ana 12 | Kısmi | Gizlilik ve erişilebilirlik denetimi. |
| Ana 13 | Kısmi | Android/Pardus ve fiziksel pilot. |
| H1 | Kısmi | Web derlemesi geçti; Android APK açık. |
| H2 | Kısmi | Sentetik kapı geçti; basılı kart açık. |
| H3 | Kısmi | Sentetik kapı geçti; gerçek kamera açık. |
| H4 | Kısmi | Yanıt yazımında oturum, sınıf ve iki/üç seçenekli soruların geçerli şıkları doğrulandı; gerçek tarayıcı/kamera açık. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android APK ve cihaz testi. |
| H7 | Kısmi | 40×5 Node testi geçti; tarayıcı/fiziksel sınıf açık. |
| HK | Açık | Bağımsız son kabul denetimi. |

Sonraki iş: gerçek tarayıcıda iki/üç seçenekli canlı oturum, Android tarama dosyası ve çevrimdışı yeniden açma; SDK/Gradle ortamında APK derleme.
