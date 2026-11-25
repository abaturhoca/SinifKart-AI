# SınıfKart AI · v26 yazılım raporu · 24 Kasım 2026

Drive ve Library'deki en güncel v25 ZIP SHA-256 `dbff69ad8b09226beeaa5a65e1a87d3e1687ba3a597abea83841fe7fc54cc0e5` ile birebir aynı; rapor metinleri de aynı. v25 temel alındı. Soru bankası 120 soru, SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: Vite üretim derlemesine sürümlü service worker üretimi eklendi. Üretim paneli açıldığında uygulama kabuğu, müfredat, mevcut soru bankası ve tarama kodu dahil 7 statik dosya önbelleğe alınıyor. Aynı kaynaktan çevrimdışı yeniden gezinmede kabuk ve soru bankası önbellekten veriliyor. Yeni sürüm başarıyla kurulduğunda eski statik önbellek temizleniyor. Öğrenci listesi, yanıtlar ve yedek dosyaları statik önbelleğe alınmıyor; IndexedDB ve yerel yedek akışı ayrı kalıyor. Panel hazırlık durumunu gösteriyor.

Doğrulama: `npm run build` TypeScript, Vite ve `dist/sw.js` üretimini tamamladı. `npm run test:offline` yedi dosyanın varlığını, kurulum/aktivasyon, eski önbellek temizliği, çevrimdışı gezinti/soru bankası dönüşü ve özel veri yollarının önbelleğe alınmamasını taklit ortamda doğruladı. Yedi mevcut Node testi de geçti; 40×5 rapor 200 kayıt, sentetik yön 400/400. OpenCV 15,5 MB parça ve `fs`/`crypto` tarayıcı uyumluluk uyarıları sürüyor. Gerçek tarayıcıda internet kesme/yeniden açma, Android APK, P580, kamera ve basılı kart testleri yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android APK ve P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Oturum bazlı sınıf ayrımı Node testinde geçti; gerçek tarayıcı/cihaz açık. |
| Ana 7 | Kısmi | 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Canlı oturum ve seçenek filtresi kod/testi geçti; cihaz açık. |
| Ana 9 | Kısmi | Çevrimdışı statik önbellek ve yerel yedek testleri geçti; gerçek tarayıcıda internet kesme ve geri yükleme açık. |
| Ana 10 | Kısmi | 40×5 Node raporu geçti; uzun dönem/tarayıcı kabulü açık. |
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

Sonraki yazılım işi: gerçek tarayıcıda çevrimdışı yeniden açma; ardından Android SDK/Gradle ortamında APK derleme.
