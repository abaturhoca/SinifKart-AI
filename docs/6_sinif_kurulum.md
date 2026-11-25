# SınıfKart · altı sınıfın kurulumu

Kaynak çalışma kitabındaki 5-A, 5-B, 5-C, 6-A, 6-B ve 6-C sayfaları okundu. Her sınıfta 26 öğrenci ve toplamda 156 kayıt doğrulandı. Kartlar her sınıfta 1–26 olarak atandı. Aynı kart numarasının farklı sınıflarda kullanılması beklenen sınıf ayrımıdır.

`pilot/Veri/sinifkart.sqlite` öğretmen panelinin yerel veritabanıdır. `pilot/Baslat.cmd` açıldığında bu dosya kullanılır. İşlemler sınıf ve sınav seçimine bağlıdır. Altı sınıfın kayıtları puan çizelgesindeki ad ve okul numaralarıyla alındı; bu işlem puanları sınava dönüştürmedi.

`pilot/import_classes.py` aynı çalışma kitabıyla tekrar çalıştırıldığında eşdeğer kayıtları atlar. Aynı adlı sınıfın listesi farklıysa veri üzerine yazmadan hata verir. İçe aktarma altı sınıf için tek veritabanı işlemidir. Eski veritabanı olan başka bir bilgisayarda sınıfları körlemesine birleştirmek yerine ilgili listenin farklılığı önce incelenmelidir.

Tekrar denemede 6 sınıf, 156 öğrenci ve her sınıfta 1–26 kart yeniden doğrulandı. Android APK, basılı kart ve canlı sınıf deneyleri açık.
