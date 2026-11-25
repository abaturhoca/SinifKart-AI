# SınıfKart AI · v25 yazılım raporu · 24 Kasım 2026

Drive ve Library'deki en güncel v24 ZIP SHA-256 `f1186d5bce6c42dc4d652d447d7e145a20fcb755a37b986a348e391426b32b39` ile birebir aynı; rapor metinleri de aynı. v24 temel alındı. Soru bankası 120 soru ve SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444` olarak korundu.

Bu tur: Bir oturumda soru/yanıt oluştuğunda farklı sınıf listesinin içe aktarımı atomik olarak reddediliyor. Yeni oturumda farklı sınıf kabul ediliyor. Eski oturum seçilince kendi soru anlık görüntüsündeki sınıf listesi panele geri yükleniyor. Aynı oturumda farklı sınıfla yeni bir soru açma da reddediliyor. Böylece aynı öğrenci numarasını kullanan iki sınıfın tek oturum raporunda karışması önleniyor.

Test: `test-indexeddb.mjs` eski oturumda farklı sınıf reddini ve eski sınıfın korunmasını, yeni oturumda ikinci sınıfı, eski oturuma dönünce doğru sınıfın geri gelmesini, farklı sınıfla ikinci soru reddini doğruladı. Diğer altı Node testi ve `npm run build` geçti; 40×5 rapor 200 kayıt, sentetik yön 400/400. Güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` tarayıcı uyumluluk uyarıları sürüyor. Gerçek tarayıcı, Android APK, P580, kamera ve basılı kart testleri yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android APK ve P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Oturum bazlı sınıf ayrımı Node testinde geçti; gerçek tarayıcı/cihaz kabulü açık. |
| Ana 7 | Kısmi | 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Canlı oturumda sınıf karışması reddi geçti; cihaz kabulü açık. |
| Ana 9 | Kısmi | Yerel yedek otomatik testi geçti; gerçek tarayıcı çevrimdışı kabulü açık. |
| Ana 10 | Kısmi | Sınıf karışmasını önleme ve 40×5 Node raporu geçti; uzun dönem kabulü açık. |
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

Sonraki yazılım işi: gerçek tarayıcıda çoklu oturum ve yeniden açma kabulü; Android SDK/Gradle ortamında APK derleme.
