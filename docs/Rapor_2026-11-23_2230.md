# SınıfKart AI – 23 Kasım 2026 devam raporu

## Bu tur
En yeni kaynak `SinifKart_Birlesik_v5_Kazanim_40_Soru_2026-11-23.zip` temel alındı. İçindeki 40 soru aynen korundu. `web/public/sourced-questions.json` dosyasına FB.5.1.4 için 10 kaynak temelli, kısa dört şıklı soru eklendi. Toplam **50/630**; 5 öğrenme çıktısı 10'ar soru içeriyor. İç kod FB.5.1.4 ile MEB belgesindeki FB.5.1.3.1 eşlemesi yalnız başlığa dayanmıyor: MEB PDF kapağı ve s. 4'te tam öğrenme çıktısı metni, katalogdaki metinle karşılaştırıldı.

Kaynak: https://cdn.eba.gov.tr/yardimcikaynaklar/2024/09/olcmearaclari/5fen1_3_1.pdf. Sorular belgedeki basılı s. 9 ve s. 12 maddelerinden ve s. 4 model yönergesinden kısaltılarak uyarlandı; konum ve doğru cevap gerekçesi her soru kaydındadır. Çoğunun dört şıkkı kaynakta yoktu; öğretmenin talebi doğrultusunda oluşturuldu. PDF'de bu maddeler için ayrıca yayımlanmış cevap anahtarı bulunmadı; cevaplar aynı PDF'deki model ve açıklamalarla doğrulandı. Genel yeniden dağıtım izni doğrulanmadı; sınıf içi öğretmen gözden geçirmesi gerekir. Kaynak metninin doğrudan çoğaltıldığı iddia edilmez.

## Doğrulama
- `npm install --offline`, `npm run build`: geçti (TypeScript ve Vite). OpenCV paketi 15,5 MB üretim parçası; P580 performansı bilinmiyor.
- `node test-roster.mjs`: 2 geçerli, 6 hatalı durum geçti.
- `node test-scan.mjs`: 400/400 sentetik yön geçti.
- Soru bankası: 50 toplam, FB.5.1.4 10/10, her soruda dört farklı şık, kaynak URL'si, sayfa/madde konumu, cevap gerekçesi geçti.
- Android APK derlenmedi; gerçek kamera, basılı kart ve fiziksel sınıf kabulü yapılmadı. Pilot v3 Edge yeniden açılış deneyi önceki kayıttan korunuyor.

## Prompt durumu
20 izlenen prompt: **1 tamam, 19 kısmi, 0 bekleyen**. H2 ve H3'ün sentetik teknik kapıları geçmesi nihai kabul sayılmadı. Ana Prompt 0 ve HK ayrıca izlenir.

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 1 | Tamam | Ürün gereksinimleri ve 22 senaryo mevcut. |
| Ana 2 | Kısmi | Android/P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı. |
| Ana 4 | Kısmi | Gerçek kamera görüntüleri. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Öğrenci nakli ve arşiv. |
| Ana 7 | Kısmi | 50/630 soru; öğretmen incelemesi ve kalan 580. |
| Ana 8 | Kısmi | Canlı cihaz eşleşmesi. |
| Ana 9 | Kısmi | Mobil çevrimdışı kabul. |
| Ana 10 | Kısmi | Uzun dönem rapor kabulü. |
| Ana 11 | Kısmi | Gerçek model ve öğretmen kabulü. |
| Ana 12 | Kısmi | Tam gizlilik ve güvenlik denetimi. |
| Ana 13 | Kısmi | APK/Pardus/fiziksel pilot. |
| H1 | Kısmi | Android derleme. |
| H2 | Kısmi | Basılı kart; sentetik kapı geçti. |
| H3 | Kısmi | Gerçek kamera; sentetik kapı geçti. |
| H4 | Kısmi | Gerçek kamera ve FPS. |
| H6 | Kısmi | P580 web kamera deneyi. |
| H5 | Kısmi | Android derleme ve cihaz deneyi. |
| H7 | Kısmi | Fiziksel sınıf deneyi. |

Ana 0: başlangıç kaynakları karşılaştırıldı; prompt dizisi ayrı dosya olarak bu turda bulunamadı. HK: bağımsız nihai denetim açık.

**Sıradaki komut:** FB.5.2.1 için güncel çıktı kodunu MEB belgesindeki tam metinle doğrula; kaynaktaki 10 gerçek maddeyi ve cevap kanıtını tespit edip kısa dört şıklı soru bankasına ekle. Ardından derleme ve yapısal testleri çalıştır. Android CI gerçek depoda çalıştırılabiliyorsa H5 derlemesini ayrıca yap; fiziksel testleri sonuç olmadan tamamlandı işaretleme.
