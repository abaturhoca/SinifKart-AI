# SınıfKart AI ürün gereksinimleri

Öğretmen, öğrencilerin telefon kullanmasına gerek kalmadan basılı kartlarla bir soruya verdikleri cevapları toplar. Öğrenci seçtiği harfi yukarı çevirir. Tahtada soru ve toplu sonuç görünür. Öğretmen cihazında hangi öğrencilerin henüz yanıt vermediğini görür. Okul yöneticisinin rolü V3'te öğretmenlerin paylaşmayı seçtiği sınıf özetlerini incelemektir.

## Sürüm kapsamı

MVP bir öğretmen, 1–100 kart, 2–4 seçenekli sorular, sınıf listesi, baskı, yerel soru oturumu, tarama, elle düzeltme ve dosyayla sonuç aktarımını kapsar. İlk teknik prototip yalnızca bu kapsamın kart okuma riskini sınar. V2 çok sorulu sınav yönetimini, kazanım analizini, XLSX/PDF raporlarını ve yerel ağ üzerinden canlı aktarımı ekler. V3 okul düzeyinde rol yönetimi ve isteğe bağlı yapay zekâ araçlarını kapsar.

|Modül / öncelik|Öğretmen veya öğrenci için işlev|İşletim koşulu ve hata davranışı|Bağımlılık / kabul ölçütü|
|---|---|---|---|
|Sınıf ve liste / MVP|Öğretmen sınıf oluşturur, listeyi önizleyip aktarır.|Türkçe adlar korunur. Boş satır atlanır. Kapasite aşımı tüm aktarımı durdurur.|Yerel kayıt / aktarılan geçerli satır kadar öğrenci oluşur.|
|Kart atama / MVP|Her öğrenci bir oturumda tek kart alır.|Aynı numara aynı sınıfta iki öğrenciye atanamaz.|Sınıf / çakışan atama kaydı değiştirmez.|
|Kart baskısı / MVP|Öğretmen A4 PDF'den kart basar.|Siyah beyaz, %100 ölçek, kesim çizgisi ve beyaz boşluk korunur.|Sözlük / 100 ayrı kimlik dört yönde sabit kalır.|
|Soru / MVP|Öğretmen 2–4 seçenek ve tek doğru cevap girer.|Etkin olmayan seçenek anahtar olamaz.|Şema / geçersiz soru açılamaz.|
|Tahta / MVP|Sınıf etkin soruyu ve seçeneklerini okur.|Tam ekran ve büyük yazı gerekir. Öğrenci adları ve anahtar soru açıkken gizlidir.|Oturum / yalnız seçili soru görünür.|
|Tarama / MVP|Öğretmen birden çok geçişte aynı sınıfı tarar.|Çelişki veya kararsız açıda kesin cevap yazılmaz.|Kimlik ve yön çözücü / kabul ölçütleri dosyası.|
|Kayıt / MVP|Öğretmen onaylı cevabı görebilir, düzeltebilir ve oturuma dönebilir.|Kapanma ve aktarım tekrarında onaylı yanıt korunur.|Kalıcı depo / öğrenci ve soru başına tek güncel cevap.|
|Sonuç / MVP|Öğretmen soru dağılımını ve CSV'yi alır.|Yanıtsız ayrı görünür, Türkçe metin korunur.|Onaylı kayıt / sayılar sınıf mevcuduyla uyuşur.|
|Sınav ve kazanım / V2|Öğretmen çok sorulu sınavı kazanımlarına göre değerlendirir.|Kazanımsız soru ayrı gruplanır. Payda görünür.|Soru etiketleri / elde hesaplanan dağılım ile eşleşir.|
|Excel ve PDF / V2|Öğretmen raporu arşivler.|Uzun sınıf adları ve Türkçe karakterler kırpılmaz.|Rapor modeli / iki dosyada da aynı toplam görünür.|
|Okul özeti / V3|Yönetici paylaşılmış sınıf özetlerini karşılaştırır.|Erişim kapsamı okul ve öğretmen paylaşımına bağlıdır.|Rol ve kapsam / kapsam dışı sınıf açılmaz.|

Başarı ölçümü önceliği yanlış öğrenciye kesin kayıt sayısı, ardından okuma oranı ve gecikmedir. Sayısal eşikler acceptance-criteria.md içindedir.
