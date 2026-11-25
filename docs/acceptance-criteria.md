# Kabul ve denetim

|Kapı|Tekrarlanabilir kontrol|Geçme şartı|
|---|---|---|
|Liste|Boş satır, adaş, çakışan numara ve 101 kişilik dosyaları içe al.|Kapasite ve atama hatalarında kısmi yazma yok. Adaşlar ayrı kalır.|
|Soru ve tahta|2, 3 ve 4 seçenekli soru aç, tahtayı ayrı pencerede izle.|Yalnız etkin seçenekler görünür. Anahtar, öğrenci adı ve bireysel puan açığa çıkmaz.|
|H1|Web geliştirme sunucusuna HTTP isteği, üretim derlemesi, uygun ve bozuk kayıtlarla şema testi; gerçek tarayıcıda çevrimdışı/rapor ve erişilebilirlik-gizlilik denetimi.|Sunucu ve build başarılıdır; şema testleri geçer; panel açılışında dış ağa istek/çerez yoktur; etkileşimli öğeler adlandırılmış, klavye odağı görünür ve ana içerik yapısı geçerlidir. Android derleme imkânı ayrıca raporlanır.|
|H2|100 basılı kart tasarımını dört yönde rasterleştir ve çöz.|400/400 doğru kimlik ve cevap, dört yönde tek kimlik. 70, 90, 110 mm baskı düzeni A4 içine sığar.|
|H3|1, 5, 10, 20 ve 40 kartlık etiketli sentetik görüntüler, ışık ve geometri varyantları.|Temiz testlerde tam eşleşme, zor örneklerde kaçırma ve yanlış cevap ayrı raporlanır.|
|H4|Aynı kartı tekrar göster, çevir, gizle, çakıştır, kamerayı kapat ve aç.|Kesin yanlış cevap sıfır, kayıt tekrarında sayım değişmez; çelişen yanıt otomatik üzerine yazılmaz. Kamera bırakılır.|
|H6/H5|Aynı fiziksel deste ve ışıkta cihaz, çözünürlük, mesafe ve kare süresini kaydet.|Hedef görünür kartlarda en az %95, 20 kartta ortalama en fazla 300 ms. Cihaz başına ayrı sonuç.|
|H7|40 kurgusal öğrenci, beş soru, beklenen yanıt tablosu, yeniden başlatma ve yeniden aktarım.|Onaylı kayıtlar geri gelir, dosya toplamı eşleşir, hiçbir kart başka öğrenciye yazılmaz.|
|Rapor|Yanlış, doğru ve boş cevap içeren bilinen örnekle CSV, V2 Excel ve PDF'yi karşılaştır.|Yanıtsız puan boş, her formatın satır ve toplamları aynı.|
|Sınıf pilotu|Fiziksel kartları 2/4/6 metrede okut, okunamayanları da say.|Görülebilen hedef sayısı, doğru, kaçan, yanlış ve gecikme cihaz bazında kayıtlı.|

Bu tablo test tasarımıdır. Çalıştırılan testlerin sonuçları ilgili aşamanın raporuna yazılır.
