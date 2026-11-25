# SınıfKart AI · v24 yazılım raporu · 24 Kasım 2026

Drive ve Library'deki en güncel v23 ZIP birebir aynı (SHA-256 `314d1e34008ca87c0b545fdc8079bd49a33c1963c4bfe690a584a1f5c3988d5b`); rapor metinleri de aynı. v23 temel alındı. Soru bankası 120 soru ve SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444` olarak değişmedi.

Bu tur: IndexedDB'deki soru anlık görüntüsü aynı oturum/soru için yeniden açılırken sınıf listesine ek olarak soru metni, kazanım ve cevap anahtarı karşılaştırılıyor. Değişiklik varsa işlem iptal ediliyor; eski yanıt ve rapor anahtarı korunuyor. Öğretmen yeni oturum açarak farklı soruyu kullanabilir. Böylece ekranda görülen soruyla eski rapor anahtarının sessizce ayrışması engelleniyor.

Test: `test-indexeddb.mjs` aynı sorunun değişmeden açılmasını, cevap anahtarı değişince ret ve eski doğru cevabın korunmasını doğruladı. Diğer altı Node testi ve `npm run build` geçti; 40×5 rapor 200 kayıt, sentetik yön 400/400. Güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` tarayıcı uyumluluk uyarıları sürüyor. Gerçek tarayıcı yeniden başlatma, Android APK, P580, kamera ve basılı kart testleri yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android APK ve P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Oturum geçmişi/yedek kodu geçti; tarayıcı/cihaz kabulü açık. |
| Ana 7 | Kısmi | 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Soru anlık görüntüsü uyuşmazlığı reddi geçti; canlı tarayıcı/cihaz kabulü açık. |
| Ana 9 | Kısmi | Yerel yedek otomatik testi geçti; gerçek tarayıcı çevrimdışı kabulü açık. |
| Ana 10 | Kısmi | Eski rapor anahtarı koruma testi geçti; uzun dönem kabulü açık. |
| Ana 11 | Kısmi | Yerel model/öğretmen kabulü; soru üretimi durduruldu. |
| Ana 12 | Kısmi | Gizlilik ve erişilebilirlik denetimi. |
| Ana 13 | Kısmi | Android/Pardus ve fiziksel pilot. |
| H1 | Kısmi | Web derlemesi geçti; Android APK açık. |
| H2 | Kısmi | Sentetik kapı geçti; basılı kart açık. |
| H3 | Kısmi | Sentetik kapı geçti; gerçek kamera açık. |
| H4 | Kısmi | Yanıt/soru uyuşmazlığı reddi geçti; gerçek tarayıcı/kamera açık. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android APK ve cihaz testi. |
| H7 | Kısmi | 40×5 Node testi geçti; tarayıcı/fiziksel sınıf açık. |
| HK | Açık | Bağımsız son kabul denetimi. |

Sonraki yazılım işi: gerçek tarayıcıda oturum/soru geçişi ve kalıcılık kabulü; Android SDK/Gradle ortamında APK derlemesi.
