package org.sinifkart.scanner

import android.app.Activity
import android.os.Bundle
import android.widget.TextView
import org.opencv.android.OpenCVLoader
import org.opencv.objdetect.ArucoDetector
import org.opencv.objdetect.Objdetect

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val message = if (OpenCVLoader.initLocal()) {
            val detector = ArucoDetector(Objdetect.getPredefinedDictionary(Objdetect.DICT_4X4_250))
            "ArUco hazır · " + detector.javaClass.simpleName
        } else "OpenCV yüklenemedi"
        setContentView(TextView(this).apply { text = message })
    }
}
