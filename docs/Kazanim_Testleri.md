# 5 ve 6. sınıf kazanım testleri

MEB Türkiye Yüzyılı Maarif Modeli Fen Bilimleri programındaki 14 ünite ve 63 öğrenme çıktısı `web/public/curriculum.json` dosyasına işlendi: 5. sınıfta 27, 6. sınıfta 36 çıktı. Her öğrenme çıktısı için hedef 10 soru; toplam hedef 630 soru.

Bu sürümde **120/630 soru**, 12 öğrenme çıktısında onar soru vardır; 51 çıktı eksiktir. İlk 110 soru v12 paketinden veri düzeyinde korunmuştur. FB.5.3.3 için MEB ölçme aracındaki altı bulmaca ipucu ve dört doğru-yanlış ifadesi dört kısa şıklı sorulara uyarlandı. Bunlar yayımlanmış on ayrı çoktan seçmeli soru değildir. Eksik testler ekranda açıkça eksik görünür ve başlatılamaz.

Kaynak önceliği: [MEB 5. sınıf kitap 1](https://tymm.meb.gov.tr/kitap/19/fen-bilimleri-5.sinif-ders-kitabi-1.kitap), [kitap 2](https://tymm.meb.gov.tr/kitap/20/fen-bilimleri-5.sinif-ders-kitabi-2.kitap); [MEB 6. sınıf kitap 1](https://tymm.meb.gov.tr/kitap/48/fen-bilimleri-6.sinif-ders-kitabi-1.kitap), [kitap 2](https://tymm.meb.gov.tr/kitap/49/fen-bilimleri-6.sinif-ders-kitabi-2.kitap). [Fenusbilim](https://www.fenusbilim.com/) ve belirli YouTube videoları yalnızca soru metni, dört şık, cevap, kazanım uygunluğu ve kullanım izni tek tek doğrulanınca eklenir. Fenusbilim'deki eski kazanım kavrama testleri güncel programla otomatik eş sayılmaz.

İçe aktarılacak JSON, kazanım kodundan (örneğin `FB.5.1.1`) tam 10 soruluk diziye eşlenir. Her soruda `stem` (en çok 140 karakter), dört kısa `options` (her biri en çok 5 kelime), `correctIndex` (0=A, 1=B, 2=C, 3=D), `source.kind` (`MEB`, `Fenusbilim`, `YouTube`), `source.url`, `source.location` (kitap sayfası veya video saniyesi), `source.permission` (kullanım izninin dayanağı) alanları zorunludur. Kaynak sorusu uzun veya şıkları uzun ise bu test için seçilmez. Cevap anahtarı kaynakta doğrulanmadan işlenmez.

Öğretmen panelindeki içe aktarma tarayıcıda yerel kayda yazar. Paket içinde 12 öğrenme çıktısı için onar soruluk test yer alır. Kazanım seçimi ve 10 soruluk tam ekran akıllı tahta gösterimi hazırdır. Mevcut kart okuma prototipiyle soruların cevapları henüz otomatik eşleştirilmez.

## Kaynak taraması, 23 Kasım 2026

MEB'in [öğrenme çıktısı ölçme araçları](https://odsgm.meb.gov.tr/www/5-sinif-fen-bilimleri/icerik/1276) sayfasındaki 2024 kodlu dosyalar, 5. sınıfın ilk üç ünitesindeki **12 güncel öğrenme çıktısına** başlıkları karşılaştırılarak aday kaynak olarak bağlandı. Bunlar doğrudan dört şıklı test olarak işlenmedi: ilk dosyadaki on kısa bulmaca sorusu açık uçlu, seçenekleri yok. 2024 kodları ile güncel MEB programındaki 2026 kodları farklı olduğundan bağlantı başlığa göre kuruldu. Her aday bağlantısı seçim ekranında görülür. Fenusbilim'in eski MEB kazanım testleri de güncel çıktı kodlarına kendiliğinden aktarılmadı.

## 24 Kasım 2026 eklemesi

[Güncel programdaki FB.5.3.3](https://tymm.meb.gov.tr/fen-bilimleri-dersi/unite/388) destek ve hareket sistemi yapılarını ayırma, gruplama ve etiketlemeyi kapsar. [MEB ölçme aracı](https://cdn.eba.gov.tr/yardimcikaynaklar/2024/09/olcmearaclari/5fen3_2_1.pdf) eski FB.5.3.2.1 kodunu taşır; başlık ve a/b/c/ç süreçleri eşleşir. Basılı s. 7 bulmaca ipuçları 1, 2, 4, 6, 7, 8 ile basılı s. 8 kodlama ifadeleri 1, 3, 6, 8 kullanıldı. Her sorunun kaynak konumu ve cevap gerekçesi kaydedildi. Genel yeniden dağıtım izni doğrulanmadı; öğretmen içerik incelemesi bekler.

Bir sonraki çıktı FB.5.3.4'tür. Kalan 51 çıktı için önce güncel kod ve kaynağın içerik uyumu doğrulanmalı; soruların kaynak konumu ve cevap gerekçesi kaydedilmelidir.
