# SınıfKart AI · v27 yazılım raporu · 24 Kasım 2026

Drive ve Library'deki en güncel v26 ZIP SHA-256 `3f56f6248d1eefbb261bb48f797e59b2f21a1f34f978ab87d635e3fe56943684` ile birebir aynı; rapor metinleri de aynı. v26 temel alındı. Soru bankası 120 soru, SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: Web raporunda öğrenci CSV'sine ek olarak ayrı soru CSV'si indiriliyor. Her soru için kazanım, soru metni, doğru cevap, katılım, doğru, yanlış, boş ve A–D yanıt sayıları yazılıyor. Sıfır yanıtlı soru raporda boş olarak korunuyor. Metin hücreleri mevcut CSV formül korumasından geçiyor; dosyalar yerel olarak oluşturuluyor.

Test: `test-report.mjs` 40 öğrenci × 5 soru için 200 kaydı, altıncı sıfır yanıtlı sorunun 40 boş ve sıfır A–D sayısını ve formül başlangıçlı soru metninin güvenli yazımını doğruladı. Diğer altı Node testi, `npm run build` ve çevrimdışı statik önbellek testi geçti. Güncel `web/dist` ve `sw.js` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` tarayıcı uyumluluk uyarıları sürüyor. Gerçek tarayıcıda CSV indirme, çevrimdışı yeniden açma, Android APK, P580, kamera ve basılı kart testleri yapılmadı. V2 Excel/PDF format eşleştirmesi açık. Kaynak ZIP gerçek öğrenci verisi içermez.

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
| Ana 8 | Kısmi | Canlı oturum kod/testi geçti; cihaz açık. |
| Ana 9 | Kısmi | Çevrimdışı önbellek/yedek testleri geçti; gerçek tarayıcı açık. |
| Ana 10 | Kısmi | Öğrenci ve soru CSV, 40×5 Node testi geçti; V2 Excel/PDF, uzun dönem ve tarayıcı kabulü açık. |
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

Sonraki yazılım işi: soru/öğrenci CSV ile V2 Excel/PDF toplamlarının aynı örnekte eşleştirilmesi; gerçek tarayıcıda indirme ve çevrimdışı kalıcılık kabulü.
