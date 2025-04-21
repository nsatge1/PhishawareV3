package com.phishaware

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import android.util.Log

class SmsService : HeadlessJsTaskService() {
    override fun onCreate() {
        super.onCreate()
        // Log lorsque le service est créé pour vérifier s'il démarre
        Log.e("SmsService", "📲 SmsService créé !")
    }

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        intent?.let {
            // Log des données qui arrivent dans l'intent
            val sender = it.getStringExtra("smsSender")
            val body = it.getStringExtra("smsBody")

            Log.d("SmsService", "📨 Données reçues - Sender: $sender, Body: $body")
            val data: WritableMap = WritableNativeMap().apply {
                putString("smsSender", it.getStringExtra("smsSender"))
                putString("smsBody", it.getStringExtra("smsBody"))
            }

            Log.e("SmsService", "🔄 Retour de la config pour le Headless task")

            return HeadlessJsTaskConfig(
                "SMSBackgroundTask", // Nom du task React Native
                data,
                5000, // Temps max d'exécution (ms)
                true // Garde le CPU éveillé
            )
        }
        Log.e("SmsService", "⚠️ Intent est nul, aucune donnée reçue.")
        return null
    }
}