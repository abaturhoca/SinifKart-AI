# SınıfKart AI · 24 Kasım 2026 yazılım raporu

Kaynak karşılaştırması: Drive PLİCKERS içindeki en yeni birleşik v15 ZIP (5.097.843 bayt) ve raporu ile Library'deki daha yeni v16 ZIP (5.080.527 bayt) karşılaştırıldı. v16, v15'in tüm dosya içeriklerini koruyor; üç Android derleme/örnek dosyası ekli, README güncel. ZIP dizin girdisi farkları içerik farkı sayılmadı. v16 temel alındı. Soru bankası **120** soru; SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`, değişmedi.

Bu tur: Web paneli etkin soru ve sınıftan Android tarayıcının kabul ettiği 32 haneli oturum anahtarını ve kart listeli JSON'u üretiyor. Android'in dışa aktardığı yanıtları yalnız aynı oturum/soru, tanımlı kartlar ve geçerli seçenekler için kabul ediyor. Öğrenci numarası eşlemesi yalnız web panelinde yapılıyor; kayıt, mevcut IndexedDB çakışma ve yinelenme korumasından geçiyor. Android'e öğrenci adı/numarası gitmiyor.

Test: Yeni köprü testinde doğru paket, farklı soru reddi, geçersiz seçenek ve bilinmeyen kart reddi geçti. `test-session`, `test-reconcile`, `test-roster`, `test-scan` geçti; sentetik yön 400/400. `npm run build` geçti. OpenCV büyük paket ve `fs`/`crypto` tarayıcı uyumluluk uyarıları sürüyor. Android APK derlenmedi: bu çalışma ortamında Gradle ve Android SDK yok. Gerçek tarayıcı yeniden başlatma, P580, kamera ve basılı kart testleri yapılmadı.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi'nin bağımsız aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android APK derlemesi ve P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera görüntüsü ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Çoklu sınıf, nakil ve gerçek cihaz kabulü. |
| Ana 7 | Kısmi | Mevcut 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Android dosyasıyla gerçek cihaz ve web tarayıcı kalıcılığı. |
| Ana 9 | Kısmi | Yeniden başlatma ve çevrimdışı geri yükleme. |
| Ana 10 | Kısmi | Web yanıtlarının rapora bağlanması ve dönem analizi. |
| Ana 11 | Kısmi | Yerel model ve öğretmen kabulü; soru üretimi durduruldu. |
| Ana 12 | Kısmi | Gizlilik ve erişilebilirlik denetimi. |
| Ana 13 | Kısmi | Android/Pardus ve fiziksel pilot. |
| H1 | Kısmi | Android derleme. |
| H2 | Kısmi | Basılı kart; sentetik teknik kapı geçti. |
| H3 | Kısmi | Gerçek kamera; sentetik teknik kapı geçti. |
| H4 | Kısmi | Tarayıcı kalıcılığı ve gerçek kamera tekrarı. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android APK ve cihaz testi. |
| H7 | Kısmi | 40 kurgusal öğrenci × 5 soru web kayıt/rapor testi; fiziksel sınıf deneyi. |
| HK | Açık | Bağımsız son kabul denetimi. |

Sıradaki yazılım işi: web IndexedDB yanıtlarını rapora bağlayan dışa aktarım ve 40 × 5 kurgusal yanıt kontrolü.
