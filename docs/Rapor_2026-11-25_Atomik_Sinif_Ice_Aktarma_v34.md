# SınıfKart AI · v34 yazılım raporu · 25 Kasım 2026

Drive ve Library'deki en güncel v33 ZIP SHA-256 `caa7144032e6e71191480561a867013302138b022052b593731bdc320ca1f299` ile birebir aynı; raporlar da SHA-256 `41d5b20ee53c3af72aefd37046d172157a0f01d25e126cdc1121a3d690674248` ile aynı. v33 temel alındı. 120 soruluk banka SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: `saveRosterForSession`, sınıf CSV içe aktarmasının veritabanı yazısı sırasında etkin oturumu aynı IndexedDB `readwrite` işlemi içinde doğruluyor. Oturum değişikliği doğrulama ile sınıf kaydı arasına giremiyor. Eski oturumdan gecikmiş sınıf içe aktarması paylaşılan sınıf listesini değiştiremiyor.

Test: `test-indexeddb.mjs` eski oturumdan sınıf kaydını reddetti ve önceki listenin korunduğunu doğruladı. Oturum, Android köprüsü, rapor 40×5, liste, kart eşleştirme ve 400/400 sentetik yön testleri geçti. `npm run build` (TypeScript + Vite + güncel servis çalışanı) ve `npm run test:offline` geçti; güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` uyarıları sürüyor. Gerçek tarayıcıda indirme/yazdırma ve çevrimdışı yeniden açma, Android APK, P580, kamera ve basılı kart kabulü yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android APK ve P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Oturum bazlı sınıf ayrımı, atomik sınıf içe aktarma ve soru seçimi Node testinde geçti; tarayıcı/cihaz açık. |
| Ana 7 | Kısmi | 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Canlı oturumda soru seçimi ve yanıt yazımı atomik bağlam doğrulamasıyla Node testinde geçti; gerçek cihaz açık. |
| Ana 9 | Kısmi | Çevrimdışı önbellek/yedek testleri geçti; gerçek tarayıcı açık. |
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

Sonraki iş: gerçek tarayıcıda sınıf içe aktarma, soru seçimi, rapor indirme/yazdırma ve çevrimdışı yeniden açma; SDK/Gradle ortamında APK derleme.
