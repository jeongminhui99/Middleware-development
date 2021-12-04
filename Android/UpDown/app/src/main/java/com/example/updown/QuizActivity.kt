package com.example.updown

import android.content.Intent
import android.graphics.Rect
import android.media.Image
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import io.socket.emitter.Emitter
import org.json.JSONObject

class QuizActivity : AppCompatActivity() {

    lateinit var player1 : TextView
    lateinit var player2 : TextView
    lateinit var player2_ans : TextView
    lateinit var arrow1 : ImageView
    lateinit var arrow2 : ImageView
    lateinit var num : EditText
    lateinit var submit : Button
    lateinit var up : Button
    lateinit var down : Button
    lateinit var correct : Button
    lateinit var finish : Button

    var player_id : Int ?= null
    var room_name : String ?= null
    var turn : String = "1"

    override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
        val focusView: View? = currentFocus
        if (focusView != null) {
            val rect = Rect()
            focusView.getGlobalVisibleRect(rect)
            val x = ev.x.toInt()
            val y = ev.y.toInt()
            if (!rect.contains(x, y)) {
                val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
                imm?.hideSoftInputFromWindow(focusView.getWindowToken(), 0)
                focusView.clearFocus()
            }
        }
        return super.dispatchTouchEvent(ev)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.game_quiz)

        room_name = intent.getStringExtra("room_name")

        arrow1 = findViewById(R.id.arrow1)
        arrow2 = findViewById(R.id.arrow2)
        player1 = findViewById(R.id.player1)
        player2 = findViewById(R.id.player2)
        num = findViewById(R.id.num)
        submit = findViewById(R.id.submmit)
        up = findViewById(R.id.up)
        down = findViewById(R.id.down)
        correct = findViewById(R.id.correct)
        player2_ans = findViewById(R.id.player2_ans)
        finish = findViewById(R.id.finish)

        player_id = 1

        if(turn == "1"){
            arrow2.visibility = View.INVISIBLE
            arrow1.visibility = View.VISIBLE
            player1.setTextColor(resources.getColor(R.color.pink))
            player2.setTextColor(resources.getColor(R.color.black))
        } else {
            arrow1.visibility = View.INVISIBLE
            arrow2.visibility = View.VISIBLE
            player2.setTextColor(resources.getColor(R.color.pink))
            player1.setTextColor(resources.getColor(R.color.black))
        }

        val mSocket = SocketHandler.getSocket()
        var intent = intent
        room_name = intent.getStringExtra("room_name").toString()

        submit.setOnClickListener {
            var s = JSONObject()
            s.put("num", num!!.text.toString())
            s.put("room", room_name.toString())
            s.put("player", player_id.toString())
            mSocket!!.emit("quiz_num", s)
        }

        up.setOnClickListener {
            var u = JSONObject()
            u.put("hint", "up")
            u.put("room", room_name.toString())
            u.put("player", player_id.toString())
            mSocket!!.emit("game", u)
        }

        down.setOnClickListener {
            var u = JSONObject()
            u.put("hint", "down")
            u.put("room", room_name.toString())
            u.put("player", player_id.toString())
            mSocket!!.emit("game", u)
        }

        correct.setOnClickListener {
            var u = JSONObject()
            u.put("hint", "correct")
            u.put("room", room_name.toString())
            u.put("player", player_id.toString())
            mSocket!!.emit("game", u)
        }

        finish.setOnClickListener {
            var f = JSONObject()
            f.put("room", room_name.toString())
            f.put("player", player_id.toString())
            mSocket!!.emit("finish", f)
        }

        mSocket!!.on("turn", player_turn)
        mSocket!!.on("game_ans", ans)
        mSocket!!.on("player-1-disconnected", player1_dis)
        mSocket!!.on("player-2-disconnected", player2_dis)
    }

    val player1_dis: Emitter.Listener = Emitter.Listener {
        var intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }

    val player2_dis: Emitter.Listener = Emitter.Listener {
        var intent = Intent(this, ConnectActivity::class.java)
        startActivity(intent)
    }

    val ans: Emitter.Listener = Emitter.Listener {
        runOnUiThread {
            player2_ans!!.text = "player2 answer : " + it[0].toString()
        }
    }

    val player_turn: Emitter.Listener = Emitter.Listener {
        turn = it[0].toString()
        runOnUiThread {
            if ( turn == "1"){
                arrow2.visibility = View.INVISIBLE
                arrow1.visibility = View.VISIBLE
                player1.setTextColor(resources.getColor(R.color.pink))
                player2.setTextColor(resources.getColor(R.color.black))
            } else if ( turn == "2"){
                arrow1.visibility = View.INVISIBLE
                arrow2.visibility = View.VISIBLE
                player2.setTextColor(resources.getColor(R.color.pink))
                player1.setTextColor(resources.getColor(R.color.black))
            }
        }
    }

}