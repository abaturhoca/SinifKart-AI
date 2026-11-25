package org.sinifkart.scanner

import android.Manifest
import android.content.pm.PackageManager
import android.database.sqlite.SQLiteDatabase
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.InputType
import android.view.ViewGroup
import android.view.WindowInsets
import android.widget.*
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import org.json.JSONArray
import org.json.JSONObject
import org.opencv.android.OpenCVLoader
import org.opencv.core.*
import org.opencv.objdetect.*
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import kotlin.math.*

class ScannerActivity : ComponentActivity() {
    private lateinit var preview: PreviewView
    private lateinit var status: TextView
    private lateinit var roomInput: EditText
    private lateinit var db: SQLiteDatabase
    private val executor = Executors.newSingleThreadExecutor()
    private val netExecutor = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())
    private val detector by lazy { ArucoDetector(Objdetect.getPredefinedDictionary(Objdetect.DICT_4X4_250)) }
    private var openCvReady = false
    private var token = "00000000000000000000000000000001"
    private var cards = (1..100).toSet()
    private var options = "ABCD"
    private var roomCode = ""
    private var provider: ProcessCameraProvider? = null
    private val sentAnswers = mutableMapOf<Int, String>()

    private val heartbeatTask = object : Runnable {
        override fun run() {
            if (roomCode.isNotEmpty() && !isDestroyed) {
                sendRoomEvent(JSONObject().put("type", "heartbeat").put("device", "Android APK"))
                mainHandler.postDelayed(this, 15000)
            }
        }
    }

    private val request = registerForActivityResult(ActivityResultContracts.RequestPermission()) {
        if (it) startCamera() else status.text = "Tarama için kamera izni gerekiyor."
    }

    private val open = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) try {
            val packet = JSONObject(contentResolver.openInputStream(uri)!!.bufferedReader().use { it.readText() })
            val key = packet.getString("sessionId")
            val count = packet.getInt("classSize")
            val choices = packet.getString("options")
            require(key.matches(Regex("[0-9a-f]{32}")) && key == packet.getString("questionId"))
            require(count in 1..100 && choices in listOf("AB", "ABC", "ABCD"))
            val ids = if (packet.has("cards")) {
                val values = packet.getJSONArray("cards")
                require(values.length() == count)
                (0 until count).map { values.getInt(it) }.toSet()
            } else (1..count).toSet()
            require(ids.size == count && ids.all { it in 1..100 })
            token = key; cards = ids; options = choices; sentAnswers.clear()
            ensureCameraAndStart()
        } catch (e: Exception) { status.text = "Oturum dosyası açılamadı." }
    }

    private val save = registerForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
        if (uri != null && token.isNotEmpty()) try {
            val rows = JSONArray()
            db.rawQuery("SELECT card,answer FROM votes WHERE token=? ORDER BY card", arrayOf(token)).use {
                while (it.moveToNext()) rows.put(JSONObject().put("cardId", it.getInt(0)).put("answer", it.getString(1)))
            }
            val result = JSONObject().put("version", 1).put("sessionId", token).put("questionId", token).put("responses", rows)
            contentResolver.openOutputStream(uri, "wt")!!.bufferedWriter().use { it.write(result.toString()) }
            status.text = "Cevap dosyası kaydedildi."
        } catch (e: Exception) { status.text = "Dosya yazılamadı. Cevaplar cihazda saklanıyor." }
    }

    private fun dp(v: Int): Int = (v * resources.displayMetrics.density).roundToInt()

    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#0F172A"))
            fitsSystemWindows = true
            setPadding(dp(12), dp(48), dp(12), dp(12))
        }
        if (Build.VERSION.SDK_INT >= 30) {
            root.setOnApplyWindowInsetsListener { v, insets ->
                val bars = insets.getInsets(WindowInsets.Type.systemBars())
                v.setPadding(dp(12), max(bars.top, dp(36)) + dp(10), dp(12), bars.bottom + dp(8))
                insets
            }
        }

        val title = TextView(this).apply {
            text = "SınıfKart AI · Android Tarayıcı"
            textSize = 18f
            setTextColor(Color.WHITE)
            setPadding(0, 0, 0, dp(8))
        }
        root.addView(title)

        val pairRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        roomInput = EditText(this).apply {
            hint = "Web Oda Kodu (Örn: SK4829)"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS
            setTextColor(Color.WHITE)
            setHintTextColor(Color.parseColor("#94A3B8"))
            setBackgroundColor(Color.parseColor("#1E293B"))
            setPadding(dp(10), dp(8), dp(10), dp(8))
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        }
        val btnConnect = Button(this).apply {
            text = "Web'e Bağlan"
            setOnClickListener {
                val code = roomInput.text.toString().trim().uppercase()
                if (!code.matches(Regex("SK\d{4}"))) {
                    status.text = "Geçerli oda kodu girin (Örn: SK4829)"
                    return@setOnClickListener
                }
                roomCode = code
                cards = (1..100).toSet()
                options = "ABCD"
                sentAnswers.clear()
                sendRoomEvent(JSONObject().put("type", "hello").put("device", "Android APK"))
                mainHandler.removeCallbacks(heartbeatTask)
                mainHandler.postDelayed(heartbeatTask, 15000)
                status.text = "Web odasına bağlandı ($roomCode). Kamera açılıyor..."
                ensureCameraAndStart()
            }
        }
        pairRow.addView(roomInput)
        pairRow.addView(btnConnect)
        root.addView(pairRow)

        val btnRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        val btnCam = Button(this).apply {
            text = "Kamerayı Aç"
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
            setOnClickListener { ensureCameraAndStart() }
        }
        val btnOpen = Button(this).apply {
            text = "Oturum JSON"
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
            setOnClickListener { open.launch(arrayOf("application/json", "text/plain")) }
        }
        val btnExport = Button(this).apply {
            text = "Dışa Aktar"
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
            setOnClickListener { if (token.isNotEmpty()) save.launch("Cevap-" + token.take(8) + ".json") }
        }
        btnRow.addView(btnCam)
        btnRow.addView(btnOpen)
        btnRow.addView(btnExport)
        root.addView(btnRow)

        status = TextView(this).apply {
            setTextColor(Color.parseColor("#E2E8F0"))
            textSize = 14f
            setPadding(dp(4), dp(8), dp(4), dp(8))
        }
        root.addView(status)

        preview = PreviewView(this)
        root.addView(preview, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f))
        setContentView(root)

        db = openOrCreateDatabase("sinifkart", MODE_PRIVATE, null)
        db.execSQL("CREATE TABLE IF NOT EXISTS votes(token TEXT,card INTEGER,answer TEXT,PRIMARY KEY(token,card))")
        openCvReady = OpenCVLoader.initLocal()
        status.text = if (openCvReady) "Hazır. Web oda kodunu girin veya Kamerayı Aç'a dokunun." else "OpenCV yüklenemedi."
    }

    private fun ensureCameraAndStart() {
        if (!openCvReady) {
            status.text = "OpenCV yüklenemedi. Tarama başlatılamıyor."
        } else if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        } else {
            request.launch(Manifest.permission.CAMERA)
        }
    }

    private fun sendRoomEvent(obj: JSONObject) {
        val code = roomCode
        if (code.isEmpty()) return
        obj.put("room", code).put("ts", System.currentTimeMillis())
        val payload = obj.toString()
        netExecutor.execute {
            try {
                val conn = URL("https://ntfy.sh/sinifkart_room_$code").openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.connectTimeout = 5000
                conn.readTimeout = 5000
                conn.doOutput = true
                conn.outputStream.use { it.write(payload.toByteArray(Charsets.UTF_8)) }
                conn.responseCode
                conn.disconnect()
            } catch (_: Exception) {}
        }
    }

    private fun startCamera() {
        if (!openCvReady) {
            status.text = "OpenCV yüklenemedi. Tarama başlatılamıyor."
            return
        }
        val future = ProcessCameraProvider.getInstance(this)
        val key = token; val assigned = cards; val allowed = options
        future.addListener({
            if (key != token || isDestroyed) return@addListener
            try {
                val camera = future.get()
                provider = camera
                camera.unbindAll()
                val view = Preview.Builder().build().also { it.setSurfaceProvider(preview.surfaceProvider) }
                val analysis = ImageAnalysis.Builder().setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).build()
                var previous = emptyMap<Int, Pair<String, Int>>()
                analysis.setAnalyzer(executor) { frame ->
                    try {
                        val seen = readFrame(frame, assigned, allowed)
                        var lastConfirmed = ""
                        previous = seen.mapValues { (id, a) ->
                            val old = previous[id]
                            val streak = if (old?.first == a) old.second + 1 else 1
                            if (streak == 3) {
                                db.execSQL("INSERT OR REPLACE INTO votes VALUES(?,?,?)", arrayOf(key, id, a))
                                if (roomCode.isNotEmpty() && sentAnswers[id] != a) {
                                    sentAnswers[id] = a
                                    sendRoomEvent(JSONObject().put("type", "scan").put("cardId", id).put("answer", a))
                                }
                                lastConfirmed = "Onaylandı: Kart #$id -> $a"
                            }
                            Pair(a, streak)
                        }
                        runOnUiThread {
                            if (key == token) {
                                val roomTag = if (roomCode.isNotEmpty()) " [$roomCode]" else ""
                                status.text = if (lastConfirmed.isNotEmpty()) "$lastConfirmed$roomTag" else "Karede kart: ${seen.size} | Onaylı: ${sentAnswers.size}$roomTag"
                            }
                        }
                    } catch (e: Exception) {
                        runOnUiThread { status.text = "Kare işlenemedi." }
                    } finally {
                        frame.close()
                    }
                }
                camera.bindToLifecycle(this, CameraSelector.DEFAULT_BACK_CAMERA, view, analysis)
            } catch (e: Exception) { status.text = "Arka kamera başlatılamadı." }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun readFrame(frame: ImageProxy, assigned: Set<Int>, allowed: String): Map<Int, String> {
        val plane = frame.planes[0]
        val buffer = plane.buffer.duplicate()
        val start = buffer.position()
        val width = frame.width; val height = frame.height
        val gray = Mat(height, width, CvType.CV_8UC1)
        val ids = Mat()
        val corners = mutableListOf<Mat>()
        try {
            val line = ByteArray(width)
            for (y in 0 until height) {
                buffer.position(start + y * plane.rowStride)
                if (plane.pixelStride == 1) buffer.get(line) else for (x in line.indices) line[x] = buffer.get(start + y * plane.rowStride + x * plane.pixelStride)
                gray.put(y, 0, line)
            }
            detector.detectMarkers(gray, corners, ids)
            val seen = mutableMapOf<Int, String>()
            val duplicates = mutableSetOf<Int>()
            val all = mutableSetOf<Int>()
            for (i in corners.indices) {
                val id = ids.get(i, 0)[0].toInt() + 1
                if (!all.add(id)) duplicates.add(id)
                if (id !in assigned) continue
                val a = corners[i].get(0, 0); val b = corners[i].get(0, 1)
                val degrees = Math.toDegrees(atan2(b[1] - a[1], b[0] - a[0])) + frame.imageInfo.rotationDegrees
                val quarter = (degrees / 90).roundToInt()
                val answer = "ABCD"[Math.floorMod(quarter, 4)]
                if (abs(degrees - quarter * 90) < 35 && answer in allowed) seen[id] = answer.toString()
            }
            return seen.filterKeys { it !in duplicates }
        } finally { gray.release(); ids.release(); corners.forEach { it.release() } }
    }

    override fun onDestroy() {
        mainHandler.removeCallbacks(heartbeatTask)
        provider?.unbindAll()
        executor.execute { db.close() }
        executor.shutdown()
        netExecutor.shutdown()
        super.onDestroy()
    }
}
