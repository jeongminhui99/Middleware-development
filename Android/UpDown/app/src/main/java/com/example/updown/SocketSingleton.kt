package com.example.updown

import android.util.Log
import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

object SocketHandler {

    lateinit var mSocket: Socket

    @Synchronized
    fun setSocket() {
        try {
            //IO.socket 메소드는 은 저 URL 을 토대로 클라이언트 객체를 Return 합니다.
            mSocket = IO.socket("http://192.168.35.180:7000/")

        } catch (e: URISyntaxException) {

        }
    }

    @Synchronized
    fun getSocket(): Socket {
        return mSocket
    }

    @Synchronized
    fun establishConnection() {
        try {
            mSocket!!.connect()
            Log.d("Connected", "OK")
            println("OK")
        } catch (e: URISyntaxException) {
            println("no")
        }
        mSocket!!.on(io.socket.client.Socket.EVENT_CONNECT) {
            // 소켓 서버에 연결이 성공하면 호출됩니다.
            Log.i("Socket", "Connect")
            println("OKOK")
        }.on(io.socket.client.Socket.EVENT_DISCONNECT) { args ->
            // 소켓 서버 연결이 끊어질 경우에 호출됩니다.
            Log.i("Socket", "Disconnet: ${args[0]}")
        }.on(Socket.EVENT_CONNECT_ERROR) { args ->
            // 소켓 서버 연결 시 오류가 발생할 경우에 호출됩니다.
            val errorMessage = "error"
            Log.i("Socket", "Connect Error: $errorMessage")
        }
    }

    @Synchronized
    fun closeConnection() {
        mSocket.disconnect()
    }
}