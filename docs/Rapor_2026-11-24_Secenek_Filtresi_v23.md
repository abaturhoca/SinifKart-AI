# SınıfKart AI · v23 yazılım raporu · 24 Kasım 2026

Drive ve Library'deki en güncel v22 ZIP SHA-256 `08b7b5dea1057bd6e240136ef812d883e00eed57c35f04d9d6c73e0ee2dbe5fb` ile aynı; rapor metinleri de aynı. v22 temel alındı. Soru bankası 120 soru ve SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444` olarak korundu. Yeni soru yazılmadı.

Bu tur: Fotoğraf taraması etkin soru ve sınıf seçilmeden başlatılamıyor. Kart yanıtı, sorunun AB/ABC/ABCD seçenekleriyle sınırlandırıldı; örneğin iki seçenekli soruda C veya D yönü öğretmen önizlemesinde uyarı olarak kalıyor ve kayıt listesine girmiyor. Fotoğraf seçicisi yeni tarama için sıfırlanıyor; aynı dosya tekrar seçilebilir.

Doğrulama: `test-reconcile` iki seçenekli soruda B kabulü, C reddi ve eksik öğrenci sayımını doğruladı. `test-indexeddb`, `test-session`, `test-report` (40×5, 200 kayıt), `test-android-bridge`, `test-roster`, `test-scan` (400/400 sentetik yön) ve `npm run build` geçti. Güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` tarayıcı uyumluluk uyarıları sürüyor. Gerçek tarayıcıda fotoğraf/yeniden açma, APK, P580, kamera ve basılı kart testleri yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

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
| Ana 7 | Kısmi | Mevcut 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Etkin soruya bağlı tarama ve seçenek filtresi testi geçti; canlı cihaz kabulü açık. |
| Ana 9 | Kısmi | Yerel yedek otomatik testi geçti; gerçek tarayıcı çevrimdışı kabulü açık. |
| Ana 10 | Kısmi | 40×5 Node raporu geçti; tarayıcı/uzun dönem kabulü açık. |
| Ana 11 | Kısmi | Yerel model/öğretmen kabulü; soru üretimi durduruldu. |
| Ana 12 | Kısmi | Gizlilik ve erişilebilirlik denetimi. |
| Ana 13 | Kısmi | Android/Pardus ve fiziksel pilot. |
| H1 | Kısmi | Web derlemesi geçti; Android APK açık. |
| H2 | Kısmi | Sentetik kapı geçti; basılı kart açık. |
| H3 | Kısmi | Sentetik kapı geçti; gerçek kamera açık. |
| H4 | Kısmi | Yanlış seçenek reddi ve IndexedDB işlem testi geçti; gerçek tarayıcı/kamera açık. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android APK ve cihaz testi. |
| H7 | Kısmi | 40×5 Node testi geçti; tarayıcı/fiziksel sınıf açık. |
| HK | Açık | Bağımsız son kabul denetimi. |

Sonraki yazılım işi: gerçek tarayıcıda tarama önizlemesi, IndexedDB yeniden açma ve yerel yedek geri yükleme; ardından APK derleme.
