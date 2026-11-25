package org.sinifkart.scanner

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.*
import android.database.sqlite.SQLiteDatabase
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
import kotlin.math.*
import java.util.concurrent.Executors

class ScannerActivity : ComponentActivity() {
    private lateinit var preview: PreviewView
    private lateinit var status: TextView
    private lateinit var db: SQLiteDatabase
    private val executor = Executors.newSingleThreadExecutor()
    private val detector by lazy { ArucoDetector(Objdetect.getPredefinedDictionary(Objdetect.DICT_4X4_250)) }
    private var openCvReady = false
    private var token = ""
    private var cards = emptySet<Int>()
    private var options = ""
    private var provider: ProcessCameraProvider? = null
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
            require(count in 1..100 && choices in listOf("AB","ABC","ABCD"))
            val ids = if (packet.has("cards")) {
                val values = packet.getJSONArray("cards")
                require(values.length()==count)
                (0 until count).map { values.getInt(it) }.toSet()
            } else (1..count).toSet()
            require(ids.size==count && ids.all { it in 1..100 })
            token = key; cards = ids; options = choices
            if (!openCvReady) {
                status.text = "OpenCV yüklenemedi. Tarama başlatılamıyor."
            } else if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) startCamera()
            else request.launch(Manifest.permission.CAMERA)
        } catch (e: Exception) { status.text = "Oturum dosyası açılamadı." }
    }
    private val save = registerForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
        if (uri != null && token.isNotEmpty()) try {
            val rows = JSONArray()
            db.rawQuery("SELECT card,answer FROM votes WHERE token=? ORDER BY card", arrayOf(token)).use {
                while (it.moveToNext()) rows.put(JSONObject().put("cardId",it.getInt(0)).put("answer",it.getString(1)))
            }
            val result = JSONObject().put("version",1).put("sessionId",token).put("questionId",token).put("responses",rows)
            contentResolver.openOutputStream(uri,"wt")!!.bufferedWriter().use { it.write(result.toString()) }
            status.text = "Cevap dosyası kaydedildi."
        } catch (e: Exception) { status.text = "Dosya yazılamadı. Cevaplar cihazda saklanıyor." }
    }

    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        val layout = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        status = TextView(this)
        preview = PreviewView(this)
        layout.addView(Button(this).apply { text = "Oturum dosyasını aç"; setOnClickListener { open.launch(arrayOf("application/json","text/plain")) } })
        layout.addView(Button(this).apply { text = "Cevapları dışa aktar"; setOnClickListener { if(token.isNotEmpty()) save.launch("Cevap-"+token.take(8)+".json") } })
        layout.addView(status)
        layout.addView(preview,LinearLayout.LayoutParams(-1,0,1f))
        setContentView(layout)
        db = openOrCreateDatabase("sinifkart",MODE_PRIVATE,null)
        db.execSQL("CREATE TABLE IF NOT EXISTS votes(token TEXT,card INTEGER,answer TEXT,PRIMARY KEY(token,card))")
        openCvReady = OpenCVLoader.initLocal()
        status.text = if (openCvReady) "Öğretmen panelinden indirilen oturumu açın." else "OpenCV yüklenemedi."
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
                var previous = emptyMap<Int,Pair<String,Int>>()
                analysis.setAnalyzer(executor) { frame ->
                    try {
                        val seen = readFrame(frame,assigned,allowed)
                        previous = seen.mapValues { (id,a) ->
                            val old = previous[id]
                            val streak = if(old?.first == a) old.second+1 else 1
                            if(streak == 3) db.execSQL("INSERT OR REPLACE INTO votes VALUES(?,?,?)",arrayOf(key,id,a))
                            Pair(a,streak)
                        }
                        runOnUiThread { if(key==token) status.text = "Bu karede okunan kart: "+seen.size }
                    } catch (e: Exception) { runOnUiThread { status.text = "Kare işlenemedi." } }
                    finally { frame.close() }
                }
                camera.bindToLifecycle(this,CameraSelector.DEFAULT_BACK_CAMERA,view,analysis)
            } catch (e: Exception) { status.text = "Arka kamera başlatılamadı." }
        },ContextCompat.getMainExecutor(this))
    }

    private fun readFrame(frame: ImageProxy,assigned: Set<Int>,allowed: String): Map<Int,String> {
        val plane = frame.planes[0]
        val buffer = plane.buffer.duplicate()
        val start = buffer.position()
        val width = frame.width; val height = frame.height
        val gray = Mat(height,width,CvType.CV_8UC1)
        val ids = Mat()
        val corners = mutableListOf<Mat>()
        try {
            val line = ByteArray(width)
            for(y in 0 until height) {
                buffer.position(start+y*plane.rowStride)
                if(plane.pixelStride==1) buffer.get(line) else for(x in line.indices) line[x]=buffer.get(start+y*plane.rowStride+x*plane.pixelStride)
                gray.put(y,0,line)
            }
            detector.detectMarkers(gray,corners,ids)
            val seen = mutableMapOf<Int,String>()
            val duplicates = mutableSetOf<Int>()
            val all = mutableSetOf<Int>()
            for(i in corners.indices) {
                val id = ids.get(i,0)[0].toInt()+1
                if (!all.add(id)) duplicates.add(id)
                if(id !in assigned) continue
                val a = corners[i].get(0,0); val b = corners[i].get(0,1)
                val degrees = Math.toDegrees(atan2(b[1]-a[1],b[0]-a[0]))+frame.imageInfo.rotationDegrees
                val quarter = (degrees/90).roundToInt()
                val answer = "ABCD"[Math.floorMod(quarter,4)]
                if(abs(degrees-quarter*90)<35 && answer in allowed) seen[id]=answer.toString()
            }
            return seen.filterKeys { it !in duplicates }
        } finally { gray.release(); ids.release(); corners.forEach { it.release() } }
    }
    override fun onDestroy() {
        provider?.unbindAll()
        executor.execute { db.close() }
        executor.shutdown()
        super.onDestroy()
    }
}
