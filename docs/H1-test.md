# H1 teknik denetim

23 Kasım 2026, Windows geliştirme ortamı.

|Dosya veya bileşen|Çalıştırılan kontrol|Sonuç|
|---|---|---|
|docs/user-stories.md|Numaralı senaryo satırlarının sayımı|22 sınıf senaryosu. PRD ve kabul matrisi mevcut.|
|contracts/response.schema.json|PowerShell Test-Json ile iki geçerli ve beş geçersiz belge|7/7 beklenen sonuç.|
|web/package.json|Web klasöründe npm run build|npm komutu bulunamadı. Üretim çıktısı oluşmadı.|
|web/src/main.tsx|Vite sunucusunu çalıştırmak için yerel araç ve paket taraması|Vite ve React bağımlılıkları bulunamadı. Ekran ve IndexedDB tarayıcıda doğrulanamadı.|
|android/app/build.gradle.kts|Gradle, Java, adb ve Android SDK kontrolü|Derleme araçlarına erişilemedi. Uygulama ve API çağrıları derlenmedi.|
|reference/requirements.txt|İzole Python 3.12 ortamı oluşturuldu ve pip install çalıştırıldı.|Sanal ortam oluşturuldu. OpenCV için kurulabilir paket bulunamadı.|
|Paket depoları|npm kayıt deposu, PyPI ve Maven için doğrudan bağlantı denemesi|Üç alan adının DNS çözümlemesi başarısız.|
|Sürüm kontrolü|git init ve git status|Hibrit proje kendi Git çalışma ağacında.|

## ÇALIŞAN
PowerShell şema doğrulama komutu ve izole Python çalıştırıcısı.

## TEST EDİLEN
Şema iki geçerli örneği kabul etti. Aralık dışı kart, geçersiz seçenek, yanlış sözleşme sürümü, eksik soru kimliği ve beklenmeyen alan reddedildi.

## DOĞRULANAMAYAN
Web arayüzü, yeniden yükleme sonrası yerel kayıt, Android ArUco sınıfları ve cihaz davranışı. Android bağımlılığı Maven Central kataloğunda mevcut. APK üretilmedi.

## BAŞARISIZ
Web üretim derlemesi başlatılamadı ve Python OpenCV kurulumu sonuçlanmadı. H1 kabulü açık. Sıradaki kart üretimi ve sonraki aşamalar beklemede.

## İkinci çalışma

Aynı IndexedDB oturum modülünü kullanan çevrimdışı panel için HTML, CSS ve JavaScript dosyaları HTTP 200 döndürdü. Her yanıt diskteki dosyayla bayt düzeyinde eşleşti. Sunucu üzerinden Python kaynak dosyası isteği 404 döndürdü. Şema testleri tekrar 7/7 geçti. Tarayıcı yeniden başlatma deneyi Edge zaman aşımı ve Chrome başlatma hatası nedeniyle sonuçsuz kaldı. Vite kabulü açık. GitHub Actions iş akışı hazırlandı, uzak çalıştırma yapılmadı.
