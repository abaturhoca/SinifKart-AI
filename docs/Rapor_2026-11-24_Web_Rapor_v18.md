# SınıfKart AI · v18 yazılım raporu

Temel v17 Library paketidir. 120 soruluk banka SHA-256 96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444 olarak aynen korundu. Soru üretilmedi.

Web panelinde oturumun IndexedDB yanıtları öğrenci ve soru tablolarına, CSV dışa aktarıma bağlandı. 40 kurgusal öğrenci × 5 soru, 200 yanıt ve 50 doğru sonucu; tekrar yüklemede ek kayıt olmaması, bir boş ve bir eşleşmeyen kayıt sınandı. Oturum, kart eşleme, CSV sınıf listesi, Android köprüsü ve rapor için beş Node testi geçti.

Altı sınıf içe aktarma aracı v17 pilotuna eklendi. Kaynak dosyadaki 5-A, 5-B, 5-C, 6-A, 6-B ve 6-C sayfalarından 26'şar öğrenci temp veritabanına alındı; ikinci içe aktarımda toplam 6 sınıf ve 156 öğrenci kaldı. Yerel SQLite veri bağlantısı açık bırakılmıyor. Android'de OpenCV açılmadan kamera başlatma engellendi. Yedi Python panel testi geçti.

Web üretim paketi bu çalışma ortamında yeniden derlenemedi. npm ve Vite bağımlılıkları bulunmuyor; web/dist eski üretim çıktısıdır ve yeni rapor ekranını içermez. Yeni raporun teslimi kaynak düzeyindedir. Kaynakta mevcut sınıf listesi değişirse geçmiş web cevapları eşleşmeyen kayıtlara gider. Hiç cevap almayan soru web raporunda sütun olarak görünmez. Bu davranışlar düzeltilip tarayıcıda doğrulanmalı.

Prompt durumu: Ana 1 tam. H2/H3 sentetik sayısal kapıları geçti. Diğer 17 başlığın ürün kabulü kısmi. Ana 7–10 yazılım çalışmaları ilerledi; Android APK/P580, gerçek kamera, basılı kart ve fiziksel altı sınıf pilotu tamamlanmadı. Sıradaki iş web raporunun oturum sınıfı ve soru listesini kalıcılaştırmak, Vite derlemesini çalıştırmak, ardından Android APK'yı derleyip gerçek cihaz deneyini ölçmektir.
