# SınıfKart AI · v19 yazılım raporu

v17 kaynakları temel alındı. 120 soruluk banka SHA-256 96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444 olarak değişmedi. Yeni soru yazılmadı.

Web IndexedDB şeması sürüm 4'e yükseltildi. Seçili soru açıldığında öğrenci-kart eşleşmesi ve cevap anahtarı oturuma kaydediliyor. Sınıf listesi sonradan değişse de eski sorunun raporu kendi kayıtlı listesiyle üretiliyor. Sıfır cevaplı seçili soru raporda boş sütun ve katılım sıfır olarak kalıyor.

40 kurgusal öğrenci × 5 soru testinde 200 cevap, 50 doğru ve tekrar kaydının korunması doğrulandı. Liste değiştikten sonra geçmiş 40 öğrenci ve 200 cevap korunuyor. Altıncı soruda sıfır yanıt ve 40 boş doğrulandı. Oturum, kart eşleme, CSV sınıf listesi, Android köprüsü ve rapor için toplam beş Node testi geçti. Yedi Python panel testi ve altı sınıfın 156 öğrencisini ikinci içe aktarmada çoğaltmama denetimi geçti.

Android OpenCV yüklenmeden kamera başlatma engellendi. Android APK ve v19 web üretim derlemesi bu ortamda doğrulanamadı. npm, Vite bağımlılıkları ve Android SDK/Gradle yok. web/dist eski derleme olarak kaldı. Yeni web rapor ekranı kaynak kodunda ve testlerde var; üretim arayüzü derlenmeden son kullanıcıya çalışır diye sunulamaz.

Prompt takibi: Ana 1 tamam, H2 ve H3 sentetik teknik kapısı geçti. Diğer 17 başlıkta tam ürün kabulü açık. Fiziksel baskı, gerçek kamera, P580, APK ve sınıf deneyi yapılmadı. Sonraki yazılım kapısı Vite build ve tarayıcı IndexedDB yeniden başlatma deneyidir. Sınıf listesi veritabanı yalnız tam özel yedektedir; kaynak ZIP'te öğrenci verisi yoktur.
