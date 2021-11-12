package com.example.pubsub

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.client.Socket.EVENT_CONNECT_ERROR
import io.socket.emitter.Emitter
import io.socket.engineio.client.EngineIOException
import org.json.JSONException
import org.json.JSONObject
import java.lang.System.err
import java.net.URISyntaxException

class MainActivity : AppCompatActivity(), SensorEventListener {

    private var mSocket: Socket ?= null
    lateinit var btn : Button
    lateinit var btn1 : Button
    lateinit var btn2 : Button
    lateinit var submit : Button
    lateinit var text : TextView
    private var now : String = ""
    private var now_card : String = "바위"
    private var sensorManager : SensorManager?= null
    private var mAccelerometerSensor : Sensor ?= null
    private var lastUpdateTime : Long = 0
    val right = listOf("가위", "바위", "보")
    val left = listOf("보", "바위", "가위")

    override fun onResume() {
        super.onResume()
        sensorManager!!.registerListener(this, mAccelerometerSensor, SensorManager.SENSOR_DELAY_UI)

    }

    override fun onPause() {
        super.onPause()
        sensorManager!!.unregisterListener(this, mAccelerometerSensor)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        btn = findViewById(R.id.btn) // 바위
        btn1 = findViewById(R.id.btn1) //가위
        btn2 = findViewById(R.id.btn2) //보
        submit = findViewById(R.id.submit)
        text = findViewById(R.id.test)
        sensorManager = this.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        mAccelerometerSensor = sensorManager!!.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

        //btn.setBackgroundColor(this.resources.getColor(R.color.gray))
        btn1.setBackgroundColor(this.resources.getColor(R.color.gray))
        btn2.setBackgroundColor(this.resources.getColor(R.color.gray))

        try {
            //IO.socket 메소드는 은 저 URL 을 토대로 클라이언트 객체를 Return 합니다.
            mSocket = IO.socket("http://192.168.35.195:7000")
            mSocket!!.connect()
            Log.d("Connected", "OK")
            println("OK")
        } catch (e: URISyntaxException) {
            Log.e("MainActivity", e.reason)
            println("no")
        }

        mSocket!!.on(io.socket.client.Socket.EVENT_CONNECT) {
            // 소켓 서버에 연결이 성공하면 호출됩니다.
            Log.i("Socket", "Connect")
            println("OKOK")
        }.on(io.socket.client.Socket.EVENT_DISCONNECT) { args ->
            // 소켓 서버 연결이 끊어질 경우에 호출됩니다.
            Log.i("Socket", "Disconnet: ${args[0]}")
        }.on(EVENT_CONNECT_ERROR) { args ->
            // 소켓 서버 연결 시 오류가 발생할 경우에 호출됩니다.
            val errorMessage = "error"
            Log.i("Socket", "Connect Error: $errorMessage")
        }

        submit.setOnClickListener {
            mSocket!!.emit("android", "now_card : " + now_card)
        }

        btn.setOnClickListener {
            val chat = "바위"
            mSocket!!.emit("android", chat)
            btn.setBackgroundColor(this.resources.getColor(R.color.purple_500))
            btn1.setBackgroundColor(this.resources.getColor(R.color.gray))
            btn2.setBackgroundColor(this.resources.getColor(R.color.gray))
            println("socket")
        }
        btn1.setOnClickListener {
            val chat = "가위"
            mSocket!!.emit("android", chat)
            btn1.setBackgroundColor(this.resources.getColor(R.color.purple_500))
            btn.setBackgroundColor(this.resources.getColor(R.color.gray))
            btn2.setBackgroundColor(this.resources.getColor(R.color.gray))
            println("socket")
        }
        btn2.setOnClickListener {
            val chat = "보"
            mSocket!!.emit("android", chat)
            btn2.setBackgroundColor(this.resources.getColor(R.color.purple_500))
            btn1.setBackgroundColor(this.resources.getColor(R.color.gray))
            btn.setBackgroundColor(this.resources.getColor(R.color.gray))
            println("socket")
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        //4 times in 1 second
        if(System.currentTimeMillis() - lastUpdateTime > 100){
            var a = event!!.values[0]
            var b = event!!.values[1]
            var c = event!!.values[2]
            if ( -15 > a && b < 0) {
                text!!.text = "Right"
                var i = right.indexOf(now_card)
                now_card = right.get((i+1)%3)
                println("now_card" + now_card)
                if (btn!!.text == now_card){
                    btn.setBackgroundColor(this.resources.getColor(R.color.purple_500))
                    btn1.setBackgroundColor(this.resources.getColor(R.color.gray))
                    btn2.setBackgroundColor(this.resources.getColor(R.color.gray))
                } else if (btn1!!.text == now_card) {
                    btn1.setBackgroundColor(this.resources.getColor(R.color.purple_500))
                    btn.setBackgroundColor(this.resources.getColor(R.color.gray))
                    btn2.setBackgroundColor(this.resources.getColor(R.color.gray))
                } else if (btn2!!.text == now_card) {
                    btn2.setBackgroundColor(this.resources.getColor(R.color.purple_500))
                    btn1.setBackgroundColor(this.resources.getColor(R.color.gray))
                    btn.setBackgroundColor(this.resources.getColor(R.color.gray))
                }
//            if (now == "" || now != "Right"){
//                mSocket.emit("android", "Right")
//                println("right")
//                now = "Right"
//            }

            }
            if ( 15 < a && b < 0) {
                text!!.text = "Left"
                var i = left.indexOf(now_card)
                now_card = left.get((i+1)%3)
                println("now_card" + now_card)
                if (btn!!.text == now_card){
                    btn.setBackgroundColor(this.resources.getColor(R.color.purple_500))
                    btn1.setBackgroundColor(this.resources.getColor(R.color.gray))
                    btn2.setBackgroundColor(this.resources.getColor(R.color.gray))
                } else if (btn1!!.text == now_card) {
                    btn1.setBackgroundColor(this.resources.getColor(R.color.purple_500))
                    btn.setBackgroundColor(this.resources.getColor(R.color.gray))
                    btn2.setBackgroundColor(this.resources.getColor(R.color.gray))
                } else if (btn2!!.text == now_card) {
                    btn2.setBackgroundColor(this.resources.getColor(R.color.purple_500))
                    btn1.setBackgroundColor(this.resources.getColor(R.color.gray))
                    btn.setBackgroundColor(this.resources.getColor(R.color.gray))
                }
//                if (now == "" || now != "Left"){
//                    mSocket.emit("android", "Left")
//                    println("left")
//                    now = "Left"
//                }

            }
            if ( b < -20 && c > 40 ) {
                text!!.text = "OK"
                if (now == "" || now != "OK"){
                    mSocket!!.emit("android", "now_card : " + now_card)
                    println("socket")
                    now = "OK"
                }
            }
            lastUpdateTime = System.currentTimeMillis()
        }

    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {

    }

}