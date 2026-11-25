# Android tarayıcı: derleme ve mevcut sınırlar

Bu klasör Android Studio ile açılabilir. JDK 17, Android SDK 35 ve Gradle 8.9 gerekir.
`gradle :app:assembleDebug` komutu APK'yı `app/build/outputs/apk/debug/app-debug.apk`
konumuna üretir. Depo kökü `hibrit` ise GitHub Actions > Android debug APK > Run workflow
ile aynı derleme yapılır; başarılı çalışma sonunda APK, Actions artifacts içinde bulunur.

APK, öğretmen panelinden ayrı çalışan yerel kamera tarayıcısıdır. Önce oturum JSON
dosyasını açar, kamerayı kullanarak ArUco kartlarının yönünü okur, üç ardışık
karede aynı yanıtı gördüğünde SQLite'a yazar ve cevap JSON dosyasını dışa aktarır.
`OTURUM_ORNEGI.json` yalnızca 1, 2 ve 3 numaralı deneme kartlarını tanımlar.
Bu örnekteki oturum anahtarını gerçek sınıf oturumu olarak kullanmayın.

Mevcut Android prototipinin beklediği oturum JSON alanları: `sessionId` ve
`questionId` aynı 32 karakterlik küçük harf onaltılık değer; `classSize` 1–100;
`options` AB, ABC veya ABCD; `cards` isteğe bağlı ve sınıf büyüklüğü kadar
benzersiz 1–100 arası kart numarası. Web paneli etkin soru için bu dosyayı
oluşturuyor ve Android cevap JSON'unu aynı soruya doğrulayarak içe alıyor.
Oturum dosyası öğrenci adı veya okul numarası içermez. Gerçek cihazda kamera ve basılı kart
testi yapılmadan sınıf kullanımına uygun olduğu doğrulanmış sayılmaz.
