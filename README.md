# SınıfKart AI hibrit prototipi

Önce docs/PRD.md ve docs/acceptance-criteria.md dosyalarını okuyun. Bu klasör eski pilotun kartları ve kayıtlarından bağımsızdır.

- Web için Node 22 ve npm ile web klasöründe `npm install`, `npm run dev` ve `npm run build` çalıştırılır. Geliştirme adresi http://127.0.0.1:5173, üretim dosyaları web/dist altındadır.
- Sözleşme için PowerShell 7.4 veya üzerinde `./contracts/test.ps1` çalıştırılır.
- Python için `python -m venv reference/.venv`, ardından ortamın Python çalıştırıcısıyla `-m pip install -r reference/requirements.txt` çalıştırılır.
- Android için JDK 17, SDK 35 ve Gradle 8.9 ile android klasöründe `gradle :app:assembleDebug` çalıştırılır. İlk ekran OpenCV yüklemeyi ve ArucoDetector oluşturmayı sınar.
- Android APK derleme iş akışı `.github/workflows/android-apk.yml`, kullanım ve prototip sınırları `android/DERLEME.md` içindedir.
- H1 sonuçları docs/H1-test.md içinde yer alır.

Basılabilir kart PDF/SVG dosyaları ve sentetik kamera görüntüleri kaynak depoda tutulmaz.
Python bağımlılıklarını kurduktan sonra `python reference/cards.py` ve
`python reference/test_detection.py` ile `reference/output` yeniden üretilir.

## Çevrimdışı H1 ekranı
web klasöründe `python yerel_panel.py` öğretmen panelini açar. Tarayıcı aynı adres ve profille açıldığında kayıt sürdürülebilir. Yeniden başlatma testi için `python test_yerel_panel.py TARAYICI_YOLU` komutu kullanılır. Hibrit klasörü depo kökü olduğunda .github/workflows/h1.yml Vite geliştirme sunucusunu, üretim derlemesini ve şema testlerini çalıştırır.
