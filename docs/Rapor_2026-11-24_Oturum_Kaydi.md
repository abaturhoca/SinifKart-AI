# SınıfKart AI · 24 Kasım 2026 oturum kaydı

**Temel:** Drive PLİCKERS ve Library'deki en güncel v14 (5.093.712 bayt) ve aynı içerikli yazılım raporu karşılaştırıldı. v13'e dönülmedi. Soru bankası 120 soru olarak aynen kaldı; `web/public/sourced-questions.json` SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`.

**Yapılan iş:** Web panelde tarama önizlemesi artık etkin soru ve yerel çalışma oturumuna bağlanıyor. Öğretmen onayı güvenilir eşleşmeleri IndexedDB `answers` deposuna `(sessionId, questionId, cardId)` anahtarıyla kaydediyor. Aynı yanıt tekrar onaylandığında yeni kayıt oluşmuyor. Farklı yanıt veya öğrenci numarası çakışması tek işlemde reddediliyor. Soru veya sınıf değişiminde eski önizleme temizleniyor. Görüntü ve öğrenci verisi dış hizmete gönderilmiyor.

**Doğrulama:** `node test-session.mjs` (oturum/soru anahtarı, tekrar, çakışma, bozuk kart), `node test-reconcile.mjs`, `node test-roster.mjs`, `node test-scan.mjs` (400/400 sentetik yön) ve `npm run build` geçti. OpenCV `fs`/`crypto` uyumluluk ve büyük paket uyarıları sürüyor. IndexedDB yazma akışı tarayıcıda yeniden başlatılarak henüz ölçülmedi; fiziksel kamera, P580 ve basılı kart testi yapılmadı.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi'nin bağımsız aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android/P580 mimari ve derleme kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera görüntüsü ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Çoklu sınıf ve gerçek cihaz kabulü. |
| Ana 7 | Kısmi | Mevcut 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Canlı oturumda gerçek tarayıcı kalıcılığı ve cihazlar arası eşleme. |
| Ana 9 | Kısmi | Yeniden başlatma ve çevrimdışı kayıt/geri yükleme. |
| Ana 10 | Kısmi | Web yanıtlarının rapora bağlanması ve dönem analizi. |
| Ana 11 | Kısmi | Yerel model/öğretmen kabulü; soru üretimi durduruldu. |
| Ana 12 | Kısmi | Gizlilik ve erişilebilirlik denetimi. |
| Ana 13 | Kısmi | Android/Pardus ve fiziksel pilot. |
| H1 | Kısmi | Android derleme. |
| H2 | Kısmi | Basılı kart; sentetik teknik kapı geçti. |
| H3 | Kısmi | Gerçek kamera; sentetik teknik kapı geçti. |
| H4 | Kısmi | Aynı kart tekrar/yön değişimi için tarayıcı kalıcılığı ve gerçek kamera testi. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android derlemesi ve cihaz testi. |
| H7 | Kısmi | 40 kurgusal öğrenci × 5 soru web kayıt/rapor testi ve fiziksel sınıf deneyi. |
| HK | Açık | Bağımsız son kabul denetimi. |

**Sıradaki yazılım işi:** IndexedDB kaydını gerçek tarayıcıda yeniden başlatıp tekrar onaylama ve rapora aktarma testini tamamlamak. Android kaynaklarını derlemeyi ayrıca denemek.
