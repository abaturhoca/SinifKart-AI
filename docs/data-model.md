# Veri modeli
Sınıfın birçok öğrencisi, sınavın birçok sorusu olabilir. Oturum belirli sınıfı, sınavı ve kart ailesini sabitler. Oturumdaki kart ataması öğrenci ile kart arasında bire birdir. Bir öğrencinin kalıcı kimliği kart numarasından ayrıdır. Oturum açıldığında atamaların kopyası alınır.

V1 cevap dosyasının alanları contracts/response.schema.json içinde tanımlıdır. Bir dosya tek soru ve oturuma aittir. cardId tam sayı olarak taşınır, baştaki sıfırlar baskı biçimidir. Güncel cevap anahtarı (sessionId, questionId, cardId) üçlüsüdür. Yinelenen cardId ve atama kapsamı uygulama düzeyinde doğrulanmalıdır. questionId ya da sessionId farklıysa aktarım reddedilir. draft deposu H1'de yalnız başlangıç ekranının yerel çalışma oturumu için kullanılır.
