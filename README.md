# Engra

**Tu banquera de bolsillo.** Una app (PWA) para apuntar gastos en dos segundos, controlar presupuestos y ahorrar, con una abuela de gafas de sol que te vigila con cariño.

- **Alta rápida**: teclado numérico propio, categorías de un toque y conceptos habituales (aprende la categoría de cada concepto).
- **Inicio con anillo de presupuesto**: lo que te queda, ritmo ideal del mes, gasto por día, previsión de cierre, reparto por categorías, histórico y consejos calculados en local.
- **Engra tiene voz**: tres tonos (cariñosa, seria, sarcástica) y tres humores (contenta con gafas de sol, vigilante con las gafas bajadas y la lupa, seria).
- **Presupuestos por categoría, objetivos de ahorro (con fecha estimada) y gastos fijos** que se apuntan solos cada mes.
- **Historial** con búsqueda, filtros, edición y borrado. Avisos cuando te acercas o te pasas del presupuesto.
- **Lectura de capturas con IA**: sube una captura de la app del banco y Engra propone los gastos ya clasificados; tú confirmas.
- **Oscuro por defecto**, tema claro y tres colores (esmeralda, violeta, oro). Funciona sin conexión.
- **Tus datos son tuyos**: se guardan en el propio dispositivo (IndexedDB). Copia de seguridad y exportación a Excel (CSV) en Ajustes.

## Probarla en tu ordenador

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # pruebas de la lógica (fechas, estadísticas, voz, copias…)
npm run build    # versión de producción
```

La lectura de capturas necesita la función de `api/classify.js`, que solo funciona publicada (o con `vercel dev`).

## Publicarla (y tenerla en el móvil)

1. Sube el repositorio a GitHub.
2. En [vercel.com](https://vercel.com) entra con GitHub, **Add New → Project**, elige este repositorio y pulsa **Deploy**. Vercel detecta Vite solo.
3. Para activar la lectura de capturas, en **Settings → Environment Variables** añade:
   - `ANTHROPIC_API_KEY`: tu clave de la [consola de Anthropic](https://console.anthropic.com).
   - `ENGRA_ACCESS_CODE`: un código inventado por ti. La app te lo pedirá una vez (se guarda solo en ese dispositivo) y evita que un desconocido gaste tu saldo.

   Vuelve a desplegar para que los cambios surtan efecto.
4. En el móvil abre la dirección que te da Vercel:
   - **iPhone**: Safari → Compartir → *Añadir a pantalla de inicio*.
   - **Android**: Chrome → menú → *Instalar app*.

Cada dispositivo tiene sus propios datos. Para pasarlos de uno a otro: Ajustes → *Copia de seguridad* y *Restaurar copia*.

## Cómo está hecha

React 19 + Vite, Dexie (IndexedDB) con consultas vivas, gráficos SVG a mano, `vite-plugin-pwa`. Sin servidor propio salvo la función `api/classify.js` (SDK oficial de Anthropic, salida estructurada).

```
src/
  lib/          lógica pura y probada (formato, estadísticas, voz, gastos fijos, copias…)
  data/         acceso a datos y escrituras (un solo sitio)
  components/   interfaz, gráficos (charts/), hojas inferiores (sheets/) y el dibujo de Engra
  screens/      Inicio, Gastos, Objetivos, Ajustes y bienvenida
  styles/       tokens de diseño (oscuro/claro, acentos) y estilos
api/classify.js función serverless de lectura de capturas
```
