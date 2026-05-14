/**
 * WEBHOOK WHATSAPP - GESTIONE RISPOSTE CLIENTI
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
      AccountSid: body.AccountSid
    });

    const fromNumber = body.From as string;
    const messageBody = (body.Body as string)?.trim().toUpperCase();
    const messageSid = body.MessageSid as string;

    if (!fromNumber || !messageBody) {
      console.log('⚠️ Dati webhook incompleti');
      return new NextResponse(
        '<Response></Response>',
        { 
          status: 200,
          headers: { 'Content-Type': 'application/xml' }
        }
      );
    }

    // Estrai il numero di telefono (rimuovi whatsapp: prefix)
    const phoneNumber = fromNumber.replace('whatsapp:', '');
    console.log('📞 Numero cliente:', phoneNumber);
    console.log('💬 Messaggio ricevuto:', messageBody);

    // Connetti al database
    await connessioneMongoDB();

    // Trova l'appuntamento del cliente
    const appuntamento = await Appuntamento.findOne({
      'utente.telefono': phoneNumber,
      stato: { $in: ['in_attesa', 'confermato'] },
      data: { $gte: new Date() }, // Solo appuntamenti futuri
      reminderSent: true
    }).sort({ data: 1 }); // Prendi il prossimo appuntamento

    if (!appuntamento) {
      console.log('❌ Nessun appuntamento trovato per:', phoneNumber);
      return new NextResponse(
        '<Response></Response>',
        { 
          status: 200,
          headers: { 'Content-Type': 'application/xml' }
        }
      );
    }

    console.log('📅 Appuntamento trovato:', {
      id: appuntamento._id,
      cliente: `${appuntamento.utente.nome} ${appuntamento.utente.cognome}`,
      data: appuntamento.data,
      stato: appuntamento.stato
    });

    // Gestisci le risposte del cliente
    let nuovoStato = null;
    let cancelledBy = null;
    let responseMessage = '';

    if (messageBody.includes('CONFERMO') || messageBody.includes('CONFERMA') || messageBody.includes('SI') || messageBody.includes('OK')) {
      nuovoStato = 'confermato';
      responseMessage = `✅ Perfetto ${appuntamento.utente.nome}! Il tuo appuntamento è confermato per ${new Date(appuntamento.data).toLocaleDateString('it-IT')} alle ${appuntamento.oraInizio}. Ti aspettiamo!`;
      
      console.log('✅ Cliente ha confermato l\'appuntamento');

    } else if (messageBody.includes('CANCELLA') || messageBody.includes('CANCELLO') || messageBody.includes('ANNULLA') || messageBody.includes('NO')) {
      nuovoStato = 'cancellato';
      cancelledBy = 'customer';
      responseMessage = `❌ Appuntamento cancellato. Grazie per averci avvisato ${appuntamento.utente.nome}. Puoi prenotare un nuovo appuntamento quando vuoi!`;
      
      console.log('❌ Cliente ha cancellato l\'appuntamento');

    } else {
      // Messaggio non riconosciuto
      responseMessage = `Ciao ${appuntamento.utente.nome}! Per confermare il tuo appuntamento rispondi "CONFERMO", per cancellare rispondi "CANCELLA".`;
      
      console.log('❓ Messaggio non riconosciuto:', messageBody);
    }

    // Aggiorna l'appuntamento se necessario
    if (nuovoStato) {
      const updateData: any = {
        stato: nuovoStato,
        updatedAt: new Date()
      };

      if (cancelledBy) {
        updateData.cancelledBy = cancelledBy;
        updateData.cancelledAt = new Date();
      }

      await Appuntamento.findByIdAndUpdate(appuntamento._id, updateData);

      console.log('📝 Appuntamento aggiornato:', {
        id: appuntamento._id,
        nuovoStato,
        cancelledBy
      });
    }

    // Log della risposta per debug
    console.log('📤 Risposta inviata al cliente:', responseMessage);

    // Restituisci risposta XML per Twilio (vuota, non inviamo risposta automatica)
    return new NextResponse(
      '<Response></Response>',
      { 
        status: 200,
        headers: { 'Content-Type': 'application/xml' }
      }
    );

  } catch (error: any) {
    console.error('❌ Errore webhook WhatsApp:', error);
    
    return new NextResponse(
      '<Response></Response>',
      { 
        status: 200,
        headers: { 'Content-Type': 'application/xml' }
      }
    );
  }
}