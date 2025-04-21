package com.phishaware

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.telephony.SmsMessage
import android.util.Log
import com.facebook.react.HeadlessJsTaskService

class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "android.provider.Telephony.SMS_RECEIVED") {
            Log.e("SmsReceiver", "📩 SMS reçu")
            val bundle: Bundle? = intent.extras
            bundle?.let {
                val pdus = it.get("pdus") as? Array<*>
                pdus?.forEach { pdu ->
                    val smsMessage = SmsMessage.createFromPdu(pdu as ByteArray)
                    val sender = smsMessage.originatingAddress
                    val messageBody = smsMessage.messageBody

                    Log.d("SmsReceiver", "📩 SMS reçu de $sender : $messageBody")

                    // Envoyer l'info au service React Native
                    val serviceIntent = Intent(context, SmsService::class.java).apply {
                        putExtra("smsSender", sender)
                        putExtra("smsBody", messageBody)
                    }
                    Log.d("SmsReceiver", "📩 Intent pour démarrer le service : $serviceIntent")
                    context.startService(serviceIntent)
                    HeadlessJsTaskService.acquireWakeLockNow(context)
                    Log.e("SmsReceiver", "📩 Service démarré et CPU éveillé")

                }
            }
        }
    }
}