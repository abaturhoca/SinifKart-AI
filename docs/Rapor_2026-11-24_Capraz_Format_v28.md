# SınıfKart AI · v28 çalışma raporu · 24 Kasım 2026

Temel: v27 Library ZIP, SHA-256 `a7f3f7feffb7d48907ea3b1040876774ce2e83fe2ddc4891f9c377d0af07eebd` (269 giriş, CRC sağlam). 120 soruluk banka değiştirilmedi; SHA-256 `96069b07d70db2bf6b14a2b833210277861b7ee4f19b3c018fb565f65c1c8444`.

## Bu tur

- Web raporunda hiç yanıt vermeyen öğrencinin doğru ve yanlış puanı boş kalıyor; boş soru sayısı yazılıyor.
- Web raporundan güvenli, yazdırılabilir HTML indirme eklendi. Dosya tarayıcıda açılıp yazdırma iletişiminden PDF olarak kaydedilebilir. Öğrenci ve soru tabloları, CSV ile aynı rapor modelinden üretilir; HTML metinleri kaçışlanır.
- Aynı kurgusal 40 öğrenci × 6 soru örneği web CSV/yazdırma ve öğretmen paneli Excel/yazdırma çıktıları arasında karşılaştırıldı. İlk beş soruda 200 yanıt ve 50 doğru; altıncı soru 0 yanıt ve 40 boş. Kart, cevap dağılımı, öğrenci toplamları ve soru toplamları eşleşti.
- Web raporunun boş puan ve HTML kaçış testleri ile altı bağımsız Node testi, sekiz Python öğretmen paneli testi geçti.

## Açık doğrulama

v28 web kaynak değişiklikleri bu Windows ortamında Vite ile yeniden derlenemedi. ZIP içindeki `web/dist`, v27 derlemesidir ve yeni yazdırma düğmesini içermez. `node_modules`, Vite, `fake-indexeddb` ve OpenCV JS paketleri yok; bu nedenle IndexedDB ve tarayıcı kart tarama testleri bu ortamda yeniden çalıştırılamadı. v27'de bunların geçtiği kayıt korunur; v28 için yeni başarı iddiası yoktur. Python `cv2` de bu çalışma Python'unda yok. Gerçek tarayıcıda indirme/PDF, çevrimdışı yeniden açma, Android APK, P580, kamera ve fiziksel kart deneyi açıktır. Yazdırılabilir HTML, doğrudan PDF dosyası değildir. Altı gerçek sınıfın özel listeleri yalnız özel tam yedekte tutulur.

## Prompt takibi

20 prompttan **1 tam kabul**, **19 kısmi kabul**. H2 ve H3 sentetik sayısal kapıları geçmiş, fiziksel kabul açık. Ana 10'da rapor biçimleri arası örnek eşleştirme geçti; gerçek tarayıcıda PDF/indirme ve uzun dönem rapor kabulü açık. Ana 0 ve HK ayrıca izlenir. Sıradaki iş v28 kaynaklarını Vite ile derleyip gerçek tarayıcıda aynı raporu indirme/yazdırma ve yeniden açılış deneyidir.
