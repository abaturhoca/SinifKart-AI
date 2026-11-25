# SınıfKart AI · 24 Kasım 2026, 07.30 durumu

Drive ve Library'de son v11 (100 soru) doğrulandı. FB.5.3.2 için MEB ölçme aracından 10 kısa dört şıklı madde eklendi: **110/630**, on bir öğrenme çıktısında 10'ar soru. İlk v5 paketindeki 40 soru veri düzeyinde birebir korundu.

Güncel program: https://tymm.meb.gov.tr/fen-bilimleri-dersi/unite/388 — FB.5.3.2 hücre-doku-organ-sistem-organizma hiyerarşisini ve uyumlu bütünü kurma. Kaynak MEB ÖDSGM sayfası: https://odsgm.meb.gov.tr/www/5-sinif-fen-bilimleri/icerik/1276 . Ölçme aracı: https://cdn.eba.gov.tr/yardimcikaynaklar/2024/09/olcmearaclari/5fen3_1_2.pdf — eski FB.5.3.1.2 kodu, a–b süreç bileşenleri güncel çıktı ile örtüşür. Eşleme başlık, kod, içerik ve süreç bileşenleriyle kontrol edildi.

Beş madde basılı s. 4 EK 1 görselinin s. 7 çalışma kâğıdı 1 kapsamındaki beş kavram etiketinden, beş madde basılı s. 6 örnek analoji ve beş satırlı tablodan uyarlandı. Bunlar on bağımsız yayımlanmış soru değil, iki yayımlanmış görevdeki on alt eşleştirmedir. Her maddede URL, basılı sayfa/alt görev ve cevap gerekçesi vardır. Görsel soruların sınıfta uygulanmasında kaynak PDF görseli de gösterilmelidir. Dört şık öğretmenin sınıf içi kullanım talebine göre hazırlandı; yeniden dağıtım izni doğrulanmadı. Öğretmen içerik incelemesi bekler.

**Test:** `npm run build` (TypeScript ve Vite), `node test-roster.mjs` (2 geçerli/6 hatalı CSV), `node test-scan.mjs` (400/400 sentetik yön) geçti. Yeni 10 maddede dört farklı şık, doğru indeks, kaynak konumu ve cevap gerekçesi yapısal kontrolü geçti. ZIP'teki kaynak ve `dist` soru bankaları eşit. Android APK, P580, basılı kart ve fiziksel sınıf testi yapılmadı. Önceki Pilot v3 Edge sonucu korunmuştur.

## Prompt durumu
20 prompt: **1 tamam, 19 kısmi, 0 bekleyen**. H2/H3 sentetik teknik kapısı fiziksel kabul sayılmaz. Ana 0 ve HK ayrıca izlenir.

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 1 | Tamam | Gereksinimler ve 22 senaryo. |
| Ana 2 | Kısmi | Android/P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı. |
| Ana 4 | Kısmi | Gerçek kamera görüntüsü. |
| Ana 5 | Kısmi | APK, kamera, FPS. |
| Ana 6 | Kısmi | Öğrenci nakli/arşiv. |
| Ana 7 | Kısmi | 110/630; kalan 520 ve öğretmen incelemesi. |
| Ana 8 | Kısmi | Canlı cihaz eşleşmesi. |
| Ana 9 | Kısmi | Mobil çevrimdışı kabul. |
| Ana 10 | Kısmi | Uzun dönem rapor kabulü. |
| Ana 11 | Kısmi | Gerçek model ve öğretmen kabulü. |
| Ana 12 | Kısmi | Tam gizlilik/güvenlik denetimi. |
| Ana 13 | Kısmi | APK/Pardus/fiziksel pilot. |
| H1 | Kısmi | Android derleme. |
| H2 | Kısmi | Basılı kart deneyi. |
| H3 | Kısmi | Gerçek kamera deneyi. |
| H4 | Kısmi | Gerçek kamera ve FPS. |
| H6 | Kısmi | P580 web kamera deneyi. |
| H5 | Kısmi | Android derleme ve cihaz deneyi. |
| H7 | Kısmi | Fiziksel sınıf deneyi. |

Ana 0: kaynaklar karşılaştırıldı. HK: bağımsız nihai denetim açık.

**Sıradaki komut:** FB.5.3.3 öğrenme çıktısını güncel programdaki kod, içerik ve süreç bileşenleriyle doğrula; 10 yayımlanmış maddeyi konum/cevap kanıtıyla bankaya ekle; derleme ve testleri çalıştır. H5 Android CI gerçek depoda erişilebilirse ayrıca dene; fiziksel deneyleri sonuç olmadan tamamlandı sayma.
