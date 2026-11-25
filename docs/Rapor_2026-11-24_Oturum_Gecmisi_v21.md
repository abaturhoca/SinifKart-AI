# SınıfKart AI · v21 yazılım raporu · 24 Kasım 2026

Drive ve Library'deki en güncel v20 ZIP birebir aynı (SHA-256 `a93f0b8f65a9f5ac2c4f47bfa4669ad32bf505b9a1047c836f49c3b76c27fb05`); rapor içerikleri de aynı. v20 temel alındı. Soru bankası 120 soru, SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: Web paneline yeni oturum başlatma ve eski oturumu seçme kontrolleri eklendi. Mevcut IndexedDB v4 `draft` deposu oturum geçmişini tutuyor; eski tek oturum kaydı açılışta geçmişe ekleniyor. Yeni oturum eski cevapları ve soru anlık görüntülerini silmiyor. Panelde oturum değişince etkin soru, tarama önizlemesi ve rapor sıfırlanıyor; eski oturuma dönülüp raporu yeniden açılabiliyor.

Anlamlı test: `test-indexeddb.mjs` yeni ve eski oturumda aynı soru kimliğiyle farklı sınıf/yanıtları ayrı tutmayı, eski oturuma dönmeyi, yinelenen yanıtı, çakışma reddini ve bilinmeyen oturum reddini doğruladı. Diğer altı Node testi geçti; 40×5 rapor 200 kayıt ve sentetik yön 400/400 korundu. `npm run build` geçti ve yeni `web/dist` ZIP'e eklendi. OpenCV 15,5 MB parça ve `fs`/`crypto` tarayıcı uyumluluk uyarıları sürüyor. Gerçek tarayıcı yeniden başlatma, Android APK, P580, kamera ve basılı kart testleri yapılmadı. Kaynak ZIP kişisel öğrenci verisi içermez.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android APK ve P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Oturum geçmişi kod/testi geçti; tarayıcı ve gerçek cihazda çoklu sınıf kabulü açık. |
| Ana 7 | Kısmi | Mevcut 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Oturum seçimi ve Vite derlemesi geçti; canlı cihaz eşlemesi açık. |
| Ana 9 | Kısmi | Gerçek tarayıcıda çevrimdışı yeniden başlatma/geri yükleme. |
| Ana 10 | Kısmi | 40×5 Node raporu geçti; uzun dönem ve tarayıcı kabulü açık. |
| Ana 11 | Kısmi | Yerel model/öğretmen kabulü; soru üretimi durduruldu. |
| Ana 12 | Kısmi | Gizlilik ve erişilebilirlik denetimi. |
| Ana 13 | Kısmi | Android/Pardus ve fiziksel pilot. |
| H1 | Kısmi | Web derlemesi geçti; Android APK açık. |
| H2 | Kısmi | Sentetik kapı geçti; basılı kart açık. |
| H3 | Kısmi | Sentetik kapı geçti; gerçek kamera açık. |
| H4 | Kısmi | IndexedDB işlem testleri geçti; gerçek tarayıcı/kamera açık. |
| H6 | Kısmi | P580 web kamera ölçümü. |
| H5 | Kısmi | Android APK ve cihaz testi. |
| H7 | Kısmi | 40×5 Node testi geçti; tarayıcı/fiziksel sınıf açık. |
| HK | Açık | Bağımsız son kabul denetimi. |

Sonraki yazılım işi: gerçek tarayıcı çalışabilen ortamda oturum geçişi ve yeniden açma kabul testi; Android derlemesi için SDK/Gradle bulunan ortam.
