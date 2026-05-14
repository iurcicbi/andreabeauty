/**
 * TEST NORMALIZZAZIONE NUMERI TELEFONO
 */

// Funzione di normalizzazione (copia da React)
function normalizzaTelefono(telefono) {
  // Rimuovi spazi, trattini e altri caratteri, ma mantieni il numero pulito
  let numeroPulito = telefono.replace(/[\s\-\(\)\.]/g, '');
  
  // Se inizia già con +39, restituisci così com'è
  if (numeroPulito.startsWith('+39')) {
    return numeroPulito;
  }
  
  // Se inizia con 39, aggiungi solo il +
  if (numeroPulito.startsWith('39') && numeroPulito.length >= 12) {
    return '+' + numeroPulito;
  }
  
  // Se inizia con 3 (numero mobile italiano), aggiungi +39
  if (numeroPulito.startsWith('3') && numeroPulito.length >= 10) {
    return '+39' + numeroPulito;
  }
  
  // Se inizia con 0 (numero fisso italiano), rimuovi SOLO il primo 0 e aggiungi +39
  if (numeroPulito.startsWith('0') && numeroPulito.length >= 10) {
    return '+39' + numeroPulito.substring(1);
  }
  
  // Altrimenti, aggiungi +39 assumendo sia un numero italiano
  return '+39' + numeroPulito;
}

console.log('📱 Test normalizzazione numeri telefono per WhatsApp');

const testCases = [
  // Casi già corretti
  { input: '+393288625535', expected: '+393288625535', desc: 'Già in formato +39' },
  
  // Casi con 39 senza +
  { input: '393288625535', expected: '+393288625535', desc: 'Con 39 senza +' },
  
  // Numeri mobili italiani (iniziano con 3)
  { input: '3288625535', expected: '+393288625535', desc: 'Mobile senza prefisso' },
  { input: '328-862-5535', expected: '+393288625535', desc: 'Mobile con trattini' },
  { input: '328 862 5535', expected: '+393288625535', desc: 'Mobile con spazi' },
  { input: '(328) 862-5535', expected: '+393288625535', desc: 'Mobile con parentesi' },
  
  // Numeri fissi italiani (iniziano con 0)
  { input: '0612345678', expected: '+39612345678', desc: 'Fisso Roma (06)' },
  { input: '02-1234567', expected: '+39021234567', desc: 'Fisso Milano (02) con trattino' },
  { input: '011 123 4567', expected: '+39111234567', desc: 'Fisso Torino (011) con spazi' },
  
  // Casi edge
  { input: '123456789', expected: '+39123456789', desc: 'Numero generico' },
  { input: '  328 862 5535  ', expected: '+393288625535', desc: 'Con spazi iniziali/finali' }
];

console.log('\n🧪 ESECUZIONE TEST:');
let passati = 0;
let falliti = 0;

testCases.forEach((test, index) => {
  const risultato = normalizzaTelefono(test.input);
  const successo = risultato === test.expected;
  
  console.log(`${index + 1}. ${test.desc}`);
  console.log(`   Input: "${test.input}"`);
  console.log(`   Expected: "${test.expected}"`);
  console.log(`   Risultato: "${risultato}"`);
  console.log(`   Status: ${successo ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  if (successo) {
    passati++;
  } else {
    falliti++;
  }
});

console.log('📊 RISULTATI:');
console.log(`✅ Test passati: ${passati}`);
console.log(`❌ Test falliti: ${falliti}`);
console.log(`📈 Percentuale successo: ${Math.round((passati / testCases.length) * 100)}%`);

if (falliti === 0) {
  console.log('\n🎉 TUTTI I TEST PASSATI!');
  console.log('✅ La funzione di normalizzazione funziona correttamente');
  console.log('✅ Tutti i numeri saranno convertiti in formato +39 per Twilio');
} else {
  console.log('\n⚠️ ALCUNI TEST FALLITI');
  console.log('❌ La funzione necessita correzioni');
}

console.log('\n📱 ESEMPI PRATICI:');
console.log('Input utente: "328 862 5535" → Output: "' + normalizzaTelefono('328 862 5535') + '"');
console.log('Input utente: "06-12345678" → Output: "' + normalizzaTelefono('06-12345678') + '"');
console.log('Input utente: "+39 328 862 5535" → Output: "' + normalizzaTelefono('+39 328 862 5535') + '"');