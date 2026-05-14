/**
 * TWILIO CLIENT - SISTEMA PROMEMORIA WHATSAPP
 */

import twilio from 'twilio';

// Configurazione client Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
const contentSid = process.env.TWILIO_CONTENT_SID;

let client: ReturnType<typeof twilio> | null = null;

/**
 * Inizializza il client Twilio solo quando necessario
 */
function initTwilioClient() {
  if (!client) {
    if (!accountSid || !authToken || !whatsappFrom || !contentSid) {
      throw new Error('Variabili d\'ambiente Twilio mancanti');
    }
    client = twilio(accountSid, authToken);
  }
  return client;
}

/**
 * Invia un promemoria WhatsApp usando il template Twilio
 */
export async function sendWhatsAppReminder(
  toPhone: string,
  customerName: string,
  appointmentTime: string,
  appointmentDate: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    console.log('📱 Invio promemoria WhatsApp:', {
      to: toPhone,
      customerName,
      appointmentTime,
      appointmentDate
    });

    // Inizializza client solo quando necessario
    const twilioClient = initTwilioClient();

    // Validazione formato numero E.164
    if (!toPhone.startsWith('+')) {
      throw new Error(`Numero telefono non in formato E.164: ${toPhone}`);
    }

    // Formatta l'orario per il template
    const orarioFormattato = `${appointmentTime} del ${appointmentDate}`;

    const message = await twilioClient.messages.create({
      contentSid: contentSid,
      from: whatsappFrom,
      to: `whatsapp:${toPhone}`,
      contentVariables: JSON.stringify({
        '1': customerName,
        '2': orarioFormattato
      })
    });

    console.log('✅ Promemoria inviato con successo:', {
      messageSid: message.sid,
      status: message.status,
      to: toPhone
    });

    return {
      success: true,
      messageSid: message.sid
    };

  } catch (error: any) {
    console.error('❌ Errore invio promemoria WhatsApp:', {
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      to: toPhone
    });

    // Gestione errori specifici Twilio
    let errorMessage = error.message;
    
    if (error.code === 21211) {
      errorMessage = 'Numero WhatsApp non valido o non registrato';
    } else if (error.code === 20429) {
      errorMessage = 'Rate limit raggiunto, riprova più tardi';
    } else if (error.code === 21408) {
      errorMessage = 'Numero non abilitato per WhatsApp';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Verifica la configurazione Twilio
 */
export function verifyTwilioConfig(): boolean {
  return !!(accountSid && authToken && whatsappFrom && contentSid);
}

/**
 * Ottieni informazioni account Twilio (per debug)
 */
export async function getTwilioAccountInfo() {
  try {
    if (!accountSid) {
      throw new Error('TWILIO_ACCOUNT_SID non configurato');
    }
    
    const twilioClient = initTwilioClient();
    const account = await twilioClient.api.accounts(accountSid).fetch();
    return {
      accountSid: account.sid,
      friendlyName: account.friendlyName,
      status: account.status
    };
  } catch (error) {
    console.error('Errore recupero info account Twilio:', error);
    return null;
  }
}