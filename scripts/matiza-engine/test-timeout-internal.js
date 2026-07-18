import assert from 'node:assert';
import { createController } from './config.js';

async function runTests() {
  console.log('--- EMPEZANDO PRUEBAS DE TIMEOUT INTERNO Y CONTROLADOR ---');

  // Caso 1: La señal externa sigue viva (no abortada), pero el timeout interno expira y aborta el controlador.
  console.log('[Caso 1] Verificando expiración por timeout interno con señal externa viva...');
  const extController1 = new AbortController();
  const { signal: signal1, cleanup: cleanup1 } = createController(50, extController1.signal);

  assert.strictEqual(signal1.aborted, false, 'El controlador no debe estar abortado al inicio');
  assert.strictEqual(extController1.signal.aborted, false, 'La señal externa no debe estar abortada al inicio');

  // Esperar a que expire el timeout interno (50ms)
  await new Promise(resolve => setTimeout(resolve, 100));

  assert.strictEqual(signal1.aborted, true, 'El controlador debe haberse abortado por el timeout interno');
  assert.strictEqual(extController1.signal.aborted, false, 'La señal externa debe seguir viva');
  
  cleanup1();
  console.log('  -> OK: El timeout interno abortó la señal local sin afectar a la externa.');

  // Caso 2: La señal externa se aborta antes del timeout interno, y esto aborta el controlador local.
  console.log('[Caso 2] Verificando propagación del abort externo...');
  const extController2 = new AbortController();
  const { signal: signal2, cleanup: cleanup2 } = createController(5000, extController2.signal);

  assert.strictEqual(signal2.aborted, false, 'El controlador no debe estar abortado');
  
  // Abortar externamente
  const abortReason = 'cancelado por usuario';
  extController2.abort(abortReason);

  assert.strictEqual(signal2.aborted, true, 'El controlador debe haberse abortado al recibir señal externa');
  assert.strictEqual(signal2.reason, abortReason, 'La razón del abort debe propagarse');

  cleanup2();
  console.log('  -> OK: El abort externo se propagó correctamente.');

  // Caso 3: Limpieza correcta de timers y listeners.
  console.log('[Caso 3] Verificando limpieza de timers y listeners...');
  let addListenerCalls = 0;
  let removeListenerCalls = 0;
  const mockExternalSignal = {
    aborted: false,
    reason: undefined,
    addEventListener(event, cb) {
      if (event === 'abort') addListenerCalls++;
    },
    removeEventListener(event, cb) {
      if (event === 'abort') removeListenerCalls++;
    }
  };

  const { signal: signal3, cleanup: cleanup3 } = createController(1000, mockExternalSignal);

  assert.strictEqual(addListenerCalls, 1, 'Debe haber registrado el listener de abort en la señal externa');
  assert.strictEqual(removeListenerCalls, 0, 'No debe haber removido el listener antes de la limpieza');

  cleanup3();

  assert.strictEqual(removeListenerCalls, 1, 'Debe haber removido el listener tras llamar a cleanup()');
  console.log('  -> OK: Limpieza retira correctamente el listener.');

  console.log('🟢 --- TODAS LAS PRUEBAS DE TIMEOUT PASARON CON ÉXITO --- 🟢');
}

runTests().catch(err => {
  console.error('❌ Error ejecutando pruebas de timeout:', err);
  process.exit(1);
});
