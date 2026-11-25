# SınıfKart AI · v22 yazılım raporu · 24 Kasım 2026

Drive ve Library'deki en güncel v21 ZIP SHA-256 `a2a580c3a9ef8f6c4fb54b0b8d6a79791d21d45b3b7add15dce5b0e9351da32b` ile birebir aynı; rapor metinleri de aynı. v21 temel alındı. Soru bankası 120 soru, SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`; değişmedi.

Bu tur: Web paneline tam yerel JSON yedek indirme ve boş cihazda geri yükleme eklendi. Yedek aktif oturumu, oturum geçmişini, sınıfı, yanıtları ve soru anlık görüntülerini içerir. İçerik geri yüklemeden önce biçim, kart aralığı, yinelenen anahtar ve öğrenci-kart eşleşmesi açısından doğrulanır. Mevcut sınıf veya yanıt bulunan cihazda geri yükleme işlemi atomik olarak reddedilir; veri silinmez. Dosya yalnız kullanıcının cihazına indirilir; öğrenci verisi dış hizmete gönderilmez.

Test: `test-indexeddb.mjs` iki oturumlu tam yedek/geri yükleme, 3 yanıt, 2 soru anlık görüntüsü, mevcut veriye çakışma reddi ve bozuk eşleşme reddini doğruladı. Diğer altı Node testi ve `npm run build` geçti. 40×5 rapor 200 kayıt, sentetik kart yönü 400/400. Güncel `web/dist` ZIP'te. OpenCV 15,5 MB parça ve `fs`/`crypto` tarayıcı uyumluluk uyarıları sürüyor. Gerçek tarayıcı yeniden başlatma, Android APK, P580, kamera ve basılı kart testleri yapılmadı. Kaynak ZIP gerçek öğrenci verisi içermez.

## Prompt durumu ve açık kabul

| Prompt | Durum | Açık kabul |
|---|---|---|
| Ana 0 | Kısmi | Ayrıntılı Prompt Dizisi aslıyla tam izlenebilirlik. |
| Ana 1 | Tamam | Gereksinim ve senaryolar belgeli. |
| Ana 2 | Kısmi | Android APK ve P580 kabulü. |
| Ana 3 | Kısmi | Fiziksel baskı deneyi. |
| Ana 4 | Kısmi | Gerçek kamera ölçümü. |
| Ana 5 | Kısmi | APK, kamera ve FPS. |
| Ana 6 | Kısmi | Oturum geçmişi ve yedek kod/testi geçti; tarayıcı/cihaz kabulü açık. |
| Ana 7 | Kısmi | Mevcut 120 sorunun öğretmen incelemesi; soru üretimi durduruldu. |
| Ana 8 | Kısmi | Oturum seçimi ve web derlemesi geçti; canlı cihaz eşlemesi açık. |
| Ana 9 | Kısmi | Yerel yedek/geri yükleme otomatik testi geçti; gerçek tarayıcıda çevrimdışı yeniden başlatma açık. |
| Ana 10 | Kısmi | 40×5 Node raporu geçti; uzun dönem/tarayıcı kabulü açık. |
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

Sonraki yazılım işi: gerçek tarayıcı çalışabilen ortamda yedek geri yükleme ve yeniden açma testi; Android SDK/Gradle ortamında APK derleme.
