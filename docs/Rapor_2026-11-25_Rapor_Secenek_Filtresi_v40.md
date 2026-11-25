# SınıfKart AI · v40 yazılım raporu · 25 Kasım 2026

Drive ve Library'deki en güncel v39 ZIP SHA-256 `815fb909efc8645616c8d0691102bc9d50bcf98b91476bcd1c1c6fc0b69f0203` ile birebir aynı; raporlar da SHA-256 `ed9b508035d0d3ec3592c70fcf51b7ffdddb0d1fe72af5784f0d45cab8775183` ile aynı. v39 temel alındı. 120 soruluk banka SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: Rapor üretimi, soru snapshot'ında seçenek sayısı varsa bu seçeneklerin dışındaki yanıtları katılım ve başarı hesabına almıyor; bunları eşleşmeyen kayıt sayısında gösteriyor. Böylece bozuk veya eski bir yanıtın iki/üç seçenekli soru sonuçlarını bozması engellendi.

Test: İki seçenekli kurgusal soruda D rapordan dışlandı, B katılıma alındı; boş sayısı ve soru CSV'si doğrulandı. 40×5 rapor toplamları, IndexedDB, oturum, Android köprüsü, liste, kart eşleştirme ve 400/400 sentetik yön testleri geçti. `npm run build` (TypeScript + Vite + güncel servis çalışanı) ve `npm run test:offline` geçti; güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` uyarıları sürüyor. Gerçek tarayıcı, Android APK, P580, kamera ve basılı kart kabulü yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

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
| Ana 10 | Kısmi | Çapraz biçim örneği, rapor yarış koruması ve seçenek dışı yanıt ayıklaması geçti; gerçek tarayıcı/PDF/uzun dönem açık. |
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

Sonraki iş: gerçek tarayıcıda iki/üç seçenekli canlı oturum, rapor indirme/yazdırma ve çevrimdışı yeniden açma; SDK/Gradle ortamında APK derleme.
