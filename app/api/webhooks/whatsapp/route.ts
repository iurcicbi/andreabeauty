/**
 * WEBHOOK WHATSAPP - GESTIONE RISPOSTE CONFERMA APPUNTAMENTO
 * 
 * Twilio chiama questo endpoint quando il cliente risponde al messaggio.
 * 
 * Flusso:
 * - Cliente risponde SI/CONFERMO/OK → appuntamento confermato
 * - Cliente risponde NO/CANCELLA/ANNULLA → appuntamento cancellato
 * - Risposta non riconosciuta → nessuna azione, log per debug
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Appuntamento from '@/utils/mongo/schemi/Appuntamento';

export async function POST(request: NextRequest) {
  try {
    console.log('📱 Webhook WhatsApp ricevuto');

    // Parse form-data da Twilio
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());

    console.log('📦 Dati webhook:', {
      From: body.From,
      To: body.To,
      Body: body.Body,
      MessageSid: body.MessageSid,
    });

    const fromNumber = body.From as string;
    const messageBody = (body.Body as string)?.trim().toUpperCase();

    if (!fromNumber || !messageBody) {
      console.log('⚠️ Dati webhook incompleti');
      return xmlResponse();
    }

    // Rimuovi prefisso whatsapp:
    const phoneNumber = fromNumber.replace('whatsapp:', '');
    console.log('📞 Numero cliente:', phoneNumber);
    console.log('💬 Messaggio ricevuto:', messageBody);

    await connessioneMongoDB();

    // Trova il prossimo appuntamento del cliente a cui è stata inviata
    // la richiesta di conferma ma non ha ancora risposto
    const appuntamento = await Appuntamento.findOne({
      'utente.telefono': phoneNumber,
      confirmationSent: true,
      confirmationResponse: null,
      stato: { $in: ['in_attesa', 'confermato'] },
      data: { $gte: new Date() }
    }).sort({ data: 1 });

    if (!appuntamento) {
      console.log('❌ Nessun appuntamento in attesa di conferma per:', phoneNumber);
      return xmlResponse();
    }

    console.log('📅 Appuntamento trovato:', {
      id: appuntamento._id,
      cliente: `${appuntamento.utente.nome} ${appuntamento.utente.cognome}`,
      data: appuntamento.data,
      stato: appuntamento.stato
    });

    // Interpreta la risposta
    const isConfirm = ['SI', 'SÌ', 'S', 'YES', 'OK', 'CONFERMO', 'CONFERMA', '1'].some(
      kw => messageBody.includes(kw)
    );
    const isCancel = ['NO', 'N', 'CANCELLA', 'CANCELLO', 'ANNULLA', 'ANNULLO', '0'].some(
      kw => messageBody.includes(kw)
    );

    if (isConfirm) {
      await Appuntamento.findByIdAndUpdate(appuntamento._id, {
        stato: 'confermato',
        confirmationResponse: 'si',
        confirmationRespondedAt: new Date()
      });

      console.log('✅ Appuntamento confermato dal cliente:', appuntamento._id);

    } else if (isCancel) {
      await Appuntamento.findByIdAndUpdate(appuntamento._id, {
        stato: 'cancellato',
        confirmationResponse: 'no',
        confirmationRespondedAt: new Date(),
        cancelledBy: 'customer',
        cancelledAt: new Date()
      });

      console.log('❌ Appuntamento cancellato dal cliente:', appuntamento._id);

    } else {
      console.log('❓ Risposta non riconosciuta:', messageBody, '— nessuna azione');
    }

    return xmlResponse();

  } catch (error: any) {
    console.error('❌ Errore webhook WhatsApp:', error);
    return xmlResponse();
  }
}

/**
 * Risposta XML vuota per Twilio (non invia messaggi automatici)
 * Il template Twilio gestisce già il testo del messaggio inviato.
 */
function xmlResponse() {
  return new NextResponse(
    '<Response></Response>',
    {
      status: 200,
      headers: { 'Content-Type': 'application/xml' }
    }
  );
}
