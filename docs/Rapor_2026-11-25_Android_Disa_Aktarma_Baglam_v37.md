# SınıfKart AI · v37 yazılım raporu · 25 Kasım 2026

Drive ve Library'deki en güncel v36 ZIP SHA-256 `ddca4d109c31ef592daa2bf4eeacd25a1ab9bf522328a70745aab255d6c13156` ile birebir aynı; raporlar da SHA-256 `21284257a971cda2795aaf01b7a71271d5ba7c03abe520d20a5fd184a5b88b9a` ile aynı. v36 temel alındı. 120 soruluk banka SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: Android oturum dosyası SHA-256 token'ı hazırlanırken etkin soru, oturum veya sınıf değişmişse indirme başlamadan işlem reddediliyor. Böylece öğretmene eski bağlamın tarama dosyası verilmesi önleniyor. Önceki Android yanıt içe aktarma koruması korunuyor.

Test: `test-android-bridge.mjs` kontrollü gecikmede eski bağlamın dışa aktarımını reddetti, güncel bağlamda dosya üretimini doğruladı. IndexedDB, oturum, rapor 40×5, liste, kart eşleştirme ve 400/400 sentetik yön testleri geçti. `npm run build` (TypeScript + Vite + güncel servis çalışanı) ve `npm run test:offline` geçti; güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` uyarıları sürüyor. Gerçek tarayıcı kabulü bu ortamda yapılamadı: `/usr/bin/chromium` başlatıcısının hedefi `/usr/lib/chromium/chromium` yok; yerel HTTP sunucusuna ayrı işlemden erişim de reddedildi. Android APK, P580, kamera ve basılı kart kabulü yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

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
| Ana 8 | Kısmi | Canlı oturumda Android oturum dosyası dışa aktarımı ve yanıt içe aktarımı bağlam değişikliğinde reddedildi; gerçek cihaz açık. |
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

Sonraki iş: gerçek tarayıcıda Android oturum dosyası indirme, çevrimdışı yeniden açma ve rapor yazdırma; SDK/Gradle ortamında APK derleme.
