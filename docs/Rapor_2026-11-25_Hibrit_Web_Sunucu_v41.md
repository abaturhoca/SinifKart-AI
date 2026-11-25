# SınıfKart AI · v41 yazılım raporu · 25 Kasım 2026

Drive ve Library'deki en güncel v40 ZIP SHA-256 `85b9c94e6ee5aa494f4a813e27a758b7810475db00280ab8c5510b67104aa69e` ile birebir aynı; raporlar da SHA-256 `0d05f54543ddf2b1e67f6bcf4235e3f8145b1de6d4863af20c840da0b93794` ile aynı. v40 temel alındı. 120 soruluk banka SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi. Gerçek öğrenci verisi kaynak ZIP'e eklenmedi.

Bu tur: Hibrit öğretmen sunucusu, React panelinin gereken `/index.html`, `/curriculum.json`, `/sourced-questions.json` ve `/sw.js` dosyalarını sunmuyordu. Bu yollar eklendi. Web servis çalışanının kapsamı hibrit sunucuda `/web/` olarak ayarlandı; böylece kökteki öğretmen paneli çevrimdışı React yönlendirmesine girmez.

Test: Hibrit HTTP entegrasyon testi yeni dört yolu içerikleriyle doğruladı ve bilinmeyen yolu 404 gördü. Web rapor, IndexedDB, oturum, Android köprüsü, sınıf içe aktarma, kart eşleştirme, 400/400 sentetik yön ve çevrimdışı önbellek testleri geçti. `npm run build` TypeScript + Vite + servis çalışanı üretimini tamamladı; güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` uyarıları sürüyor. Gerçek tarayıcı denemesinde yerel dosya URL'si ortam güvenlik kuralınca engellendi; indirme/yazdırma ve çevrimdışı yeniden açma kabulü bu yüzden yapılmadı. Android APK, P580, kamera ve basılı kart kabulü de açık.

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
| Ana 9 | Kısmi | Çevrimdışı önbellek ve hibrit sunucu statik dosya erişimi geçti; servis çalışanı /web/ kapsamında. Gerçek tarayıcı kalıcılığı açık. |
| Ana 10 | Kısmi | Çapraz biçim örneği, rapor yarış koruması ve seçenek dışı yanıt ayıklaması geçti; gerçek tarayıcı/PDF/uzun dönem açık. |
| Ana 11 | Kısmi | Yerel model/öğretmen kabulü; soru üretimi durduruldu. |
| Ana 12 | Kısmi | Gizlilik ve erişilebilirlik denetimi. |
| Ana 13 | Kısmi | Android/Pardus ve fiziksel pilot. |
| H1 | Kısmi | Web derlemesi ve hibrit sunucu HTTP entegrasyonu geçti; Android APK açık. |
| H2 | Kısmi | Sentetik kapı geçti; basılı kart açık. |
| H3 | Kısmi | Sentetik kapı geçti; gerçek kamera açık. |
| H4 | Kısmi | Yanıt yazımında oturum, sınıf ve iki/üç seçenekli soruların geçerli şıkları doğrulandı; gerçek tarayıcı/kamera açık. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android APK ve cihaz testi. |
| H7 | Kısmi | 40×5 Node testi geçti; tarayıcı/fiziksel sınıf açık. |
| HK | Açık | Bağımsız son kabul denetimi. |

Sonraki iş: erişilebilir gerçek tarayıcı ortamında canlı oturum, rapor indirme/yazdırma ve çevrimdışı yeniden açma; SDK/Gradle ortamında APK derleme.
