# SınıfKart AI · v38 yazılım raporu · 25 Kasım 2026

Drive ve Library'deki en güncel v37 ZIP SHA-256 `b5bf6aacbb4d31689e8d69d6bb7f9e7aeef06b419f77d79cc7d9d08edc7497b1` ile birebir aynı; raporlar da SHA-256 `34f481e4e977f827590926449241f8ae6e53b6dbd737989cee5305d96156dcf9` ile aynı. v37 temel alındı. 120 soruluk banka SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: Yerel yedekte bir yanıtın soru snapshot'ı yoksa, aynı oturumun başka snapshot'ındaki sınıf listesiyle öğrenci-kart eşleşmesi denetleniyor. Eski biçimli geçerli yanıtlar kabul edilmeye devam ediyor; yanlış karta bağlanmış eski yanıtlar geri yüklemeden önce reddediliyor.

Test: `test-indexeddb.mjs` snapshot'sız geçerli eski yanıtı kabul etti, yanlış kartlı sürümünü reddetti; geçerli tam yedek geri yükleme testi geçti. Oturum, Android köprüsü, rapor 40×5, liste, kart eşleştirme ve 400/400 sentetik yön testleri geçti. `npm run build` (TypeScript + Vite + güncel servis çalışanı) ve `npm run test:offline` geçti; güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` uyarıları sürüyor. Gerçek tarayıcı, Android APK, P580, kamera ve basılı kart kabulü yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

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
| H4 | Kısmi | Yanıt yazımında etkin oturum, soru kaydı ve öğrenci-kart eşleşmesi tek IndexedDB işleminde doğrulandı; gerçek tarayıcı/kamera açık. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android APK ve cihaz testi. |
| H7 | Kısmi | 40×5 Node testi geçti; tarayıcı/fiziksel sınıf açık. |
| HK | Açık | Bağımsız son kabul denetimi. |

Sonraki iş: gerçek tarayıcıda yedek geri yükleme, Android oturum dosyası indirme ve çevrimdışı yeniden açma; SDK/Gradle ortamında APK derleme.
