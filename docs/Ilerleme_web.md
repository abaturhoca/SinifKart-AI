# SınıfKart AI · 23 Kasım 2026 çalışma raporu

|Prompt|Durum|Kanıt|
|---|---|---|
|Ana 1|Tamamlandı|22 senaryo, ürün gereksinimleri ve kabul ölçütleri.|
|Ana 2 ve H1|Kısmi|Ortak şema 7/7. Yerel panel dosyaları HTTP ile sınandı. 23 Kasım devam oturumunda Vite üretim derlemesi geçti. IndexedDB tarayıcı yeniden başlatma testi ve Android derlemesi açık.|
|H2 ve Ana 3 kart üretimi|H2 sayısal kabulü geçti|001–100 için 70, 90 ve 110 mm A4 PDF, 10 kartlık örnek, SVG ve PNG. Her tam destenin PDF sayfaları görüntüye dönüştürülüp OpenCV ile 400 yönde okundu. Örnek PDF ayrıca 40/40. Fotoğrafta referans yönünde A, saat yönünde çeyrek dönüşte B okunur. Siyah işaretleyici kenarı kartın %64'üdür. Fiziksel baskı yapılmadı.|
|H3 ve Ana 4 görüntü algılama|H3 temiz görüntü kabulü geçti|400/400 kimlik-yön. 1, 5, 10, 20 ve 40 kart sahneleri tam eşleşti. Perspektif, küçük boyut, düşük ışık, bulanıklık, arka plan, ayna ve sensör dönüşü denendi. Örtülme sahnesinde 19 doğru, 1 kaçan, 0 yanlış. Ayrıntılar reference/output/H3.json içinde.|
|H4 ve Ana 5 kamera|Kısmi|Masaüstü kamera uygulaması yazıldı. Onay için ardışık üç kare, cevap değişimi, çift kartın reddi, SQLite, yeniden başlatma, JSON ve CSV sentetik karelerle geçti. Kamera aygıtı açılamadı. Gerçek FPS ölçülemedi.|
|H6 ve H5|Kısmi|H6 için çevrimdışı WebAssembly fotoğraf tarayıcısı eklendi; `web/test-scan.mjs` 100 kartın dört yönünde 400/400 doğru. Tarayıcı ve fiziksel kamera deneyi, H5 Android tarama uygulaması ve cihaz karşılaştırması açık.|
|H7|Kısmi|40 kurgusal öğrenci, 5 soru, 200/200 doğru kayıt, 0 eksik, 0 yanlış. Her soruda ara kapatma/açma ve iki manuel düzenleme. Ortalama 2,510 ms, en yüksek 13,558 ms, on kartlık sentetik karelerin algılama süresi. Fiziksel sınıf deneyi açık.|
|Ana 6|Kısmi|CSV sınıf içe aktarma ve IndexedDB kaydı eklendi. Adaş kabulü ile tekrar numara/kart, boş satır ve 101 kişi reddi `web/test-roster.mjs` ile doğrulandı. Gerçek tarayıcı yeniden açma ve kart ataması uçtan uca açık.|
|Ana 7–13|Açık|Soru bankası, tahta, çevrimdışı güvenlik, raporlar, yapay zekâ, erişilebilirlik ve yayınlama için tam ürün kabulü yapılmadı.|

## Dosya kullanımı
İlk baskı için kart-10-90mm.pdf dosyasını A4 ve gerçek boyutta (%100) yazdırın. Bu kart ailesi DICT_4X4_250 kullanır. Basılı numara OpenCV kimliğinin bir fazlasıdır. Eski pilotun okuyucusu farklı bir sözlük kullanır.

Fotoğraf için `python reference/detect_image.py foto.jpg --annotated sonuc.png` çalıştırılır. Masaüstü tarayıcısı `python reference/camera.py --session deneme --question 1 --count 40` ile açılır. Kaynakların gereksinimleri Python, OpenCV, NumPy, Pillow, ReportLab ve pypdfium2'dir. Masaüstü ön izlemesi ayrıca Tk gerektirir.

SinifKart_Drive.ipynb, Drive'daki kaynak ZIP'ini kullanarak Colab ortamında Vite ve kart testlerini tekrar çalıştırmak için hazırlandı. Colab üzerinde bu oturumda yürütülmedi. GitHub oturumu gerekmiyor.

## 23 Kasım devam oturumu
`web` klasöründe `npm install`, `npm run build` ve `node test-scan.mjs` başarılı oldu. Üretim çıktısında OpenCV modülü 15,5 MB JavaScript (sıkıştırılmış yaklaşık 3,9 MB); düşük bellekli P580 üzerinde gerçek açılış ve kare hızı henüz ölçülmedi. Sentetik H6 testi fotoğraf seçme arayüzünü, kamera ön izlemesini veya kalıcı yanıt kaydını sınamaz. Chromium tarayıcı başlatımı çalışma ortamında `socket() failed: Operation not permitted` ile durduğu için IndexedDB kalıcılığı doğrulanmadı. Android SDK ve Gradle bu ortamda bulunmadı; APK üretilmedi.

### Sıradaki komut
H1 tarayıcı kalıcılık deneyi erişilebilir tarayıcıda tekrarlanacak. Ardından H6 fotoğraf arayüzü P580'de ölçülecek ve H5 Android kamera akışı geliştirilecek; H7 fiziksel sınıf kabulü tamamlanana dek kısmi kalacak. Ana 6–13 sırasıyla sınıf, soru, tahta, çevrimdışı güvenlik, rapor, yapay zekâ, erişilebilirlik ve yayın kabulüne göre izlenecek. Her aşama için gerçekleşen test ve açık kalan kabul ayrı yazılacak.

## 23 Kasım sonraki tur
Web paneline `number,name,cardId` CSV içe aktarma eklendi. Önce tüm liste doğrulanıyor, sonra tek IndexedDB işlemiyle cihazda saklanıyor. 2 geçerli biçim ve 6 hatalı durumun Node testleri geçti. `npm run build` ve 400/400 H6 yön testi tekrar geçti. Tarayıcıda gerçek IndexedDB kalıcılığı ve cihaz kamerası sınanmadı. Ana 6 sınıf kabulü kısmi.

20 izlenen promptun (Ana 1–13 ve H1,H2,H3,H4,H6,H5,H7) kapsam özeti: Ana 1 tamam; H2 ve H3 sentetik teknik kapıyı geçti; Ana 2–6, H1, H4, H6 ve H7 kısmi; Ana 7–13 ve H5 bekliyor. Ana Prompt 0 kurulum ve HK bağımsız denetim ayrı izlenir. Teknik kapıyı geçmek fiziksel sınıf kabulü anlamına gelmez.
