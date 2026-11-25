# SınıfKart AI · v32 yazılım raporu · 25 Kasım 2026

Drive ve Library'deki en güncel v31 ZIP SHA-256 `cc111838d3ef4e454444fcf2c7bb88e72f2e12dbe96404a2f8dcaa1c4cd1807c` ile birebir aynı; raporlar da aynı SHA-256 `3df3fa485f03276c5e13a376464724da248d728024f3fe0fdcf541f48b35620e`. v31 temel alındı. 120 soruluk banka SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: `confirmAnswers` yanıt yazımı sırasında etkin oturumu, soru snapshot kaydını ve öğrenci-kart eşleşmesini aynı IndexedDB `readwrite` işlemi içinde denetliyor. Oturum değiştirme, doğrulama ile veritabanı yazısı arasına giremiyor. Eski oturuma, açılmamış soruya veya yanlış karta yanıt kaydedilmiyor.

Test: `test-indexeddb.mjs` içinde üç ret durumu ve kayıt sayısının korunması geçti. Oturum, Android köprüsü, rapor 40×5, liste, kart eşleştirme ve 400/400 sentetik yön testleri geçti. `npm run build` (TypeScript + Vite + güncel servis çalışanı) ve `npm run test:offline` geçti; güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` uyarıları sürüyor. Gerçek tarayıcıda indirme/yazdırma ve çevrimdışı yeniden açma, Android APK, P580, kamera ve basılı kart kabulü yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

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
| Ana 8 | Kısmi | Canlı oturum ve atomik yanıt yazımında etkin oturum/soru/sınıf doğrulaması Node testinde geçti; gerçek cihaz açık. |
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

Sonraki iş: gerçek tarayıcıda yanıt içe aktarma, rapor indirme/yazdırma ve çevrimdışı yeniden açma; SDK/Gradle ortamında APK derleme.
