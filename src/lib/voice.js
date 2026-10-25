// La voz de Engra: tres tonos, varias frases por situación. Todo determinista por día.
import { formatSmart, toInputDate } from './format.js';

export const TONES = {
  warm: { label: 'Cariñosa', blurb: 'Te anima y te cuida', sample: '¡Qué bien lo llevas, {name}!' },
  formal: { label: 'Seria', blurb: 'Banquera de la vieja escuela', sample: 'Su gasto está dentro de lo previsto.' },
  witty: { label: 'Sarcástica', blurb: 'Te vigila con retintín', sample: 'Nada que reprochar... por ahora.' },
};

const LINES = {
  empty: {
    warm: [
      'Mes nuevo, cartera nueva, {name}. Apunta lo que gastes y yo me encargo del resto.',
      'Aquí estoy, {name}. Cuando gastes algo, lo apuntamos juntas.',
    ],
    formal: [
      'No constan movimientos este mes. Cuando guste, registre el primero.',
      'Libro de cuentas en blanco. Aguardo sus anotaciones.',
    ],
    witty: [
      'Ni un euro gastado... qué sospechoso, {name}. ¿Seguro que no se te ha olvidado apuntar algo?',
      'Cartera intacta. Me creeré que no has comprado ni un café cuando lo vea.',
    ],
  },
  great: {
    warm: ['¡Qué bien lo llevas, {name}! Vas por debajo del ritmo del mes.', 'Da gusto ver estas cuentas, {name}. Sigue así, cariño.'],
    formal: ['Su gasto está por debajo del ritmo previsto. Excelente criterio.', 'Las cifras acompañan: va usted holgado respecto al mes.'],
    witty: ['Vas tan holgado que casi me aburro. Casi.', '¿Ahorrando sin que te lo pida, {name}? Me estás asustando.'],
  },
  ok: {
    warm: ['Todo en orden por aquí, {name}. Seguimos.', 'Vamos bien, {name}. Con tranquilidad.'],
    formal: ['El mes transcurre dentro de lo previsto. Sin novedades.', 'Sin incidencias que reseñar.'],
    witty: ['Nada que reprochar... por ahora. Te sigo vigilando, {name}.', 'Todo correcto. Qué decepción, esperaba algo que criticar.'],
  },
  watch: {
    warm: ['Ojo con {category}, {name}: ya vas por el {pct}%. Un poquito de cuidado y llegamos bien.', '{category} está al {pct}%. Frenemos un poco, ¿sí?'],
    formal: ['La partida de {category} alcanza el {pct}% de su presupuesto. Le recomiendo moderación.', '{category} se aproxima a su límite ({pct}%). Conviene prudencia.'],
    witty: ['{category} al {pct}%... ¿Te estás poniendo nervioso con la tarjeta, {name}?', 'Esa partida de {category} ({pct}%) empieza a oler a chamusquina.'],
  },
  over: {
    warm: ['Nos hemos pasado en {category}, {name}. No pasa nada, pero toca frenar.', '{category} se ha desbordado ({over} de más). Lo arreglamos, cariño.'],
    formal: ['Ha superado el presupuesto de {category} en {over}. Debemos corregir el rumbo.', 'Presupuesto de {category} excedido en {over}. Procede revisar los gastos.'],
    witty: ['{category} se ha pasado {over}. Y yo que confiaba en ti, {name}...', '{over} de más en {category}. ¿Lo has comprado con los ojos cerrados?'],
  },
  overall: {
    warm: ['Este mes nos hemos pasado {over} del total. Respira, {name}: lo enderezamos juntas.', 'Nos hemos pasado {over} del presupuesto. El mes que viene, con más cabeza, ¿vale?'],
    formal: ['El gasto total supera el presupuesto en {over}. Procede revisar las partidas.', 'Presupuesto global excedido en {over}. Recomiendo una revisión.'],
    witty: ['{over} por encima del presupuesto total. Voy a necesitar un café... y que tú dejes de gastar.', 'Presupuesto reventado por {over}. Enhorabuena, {name}, es todo un logro.'],
  },
  pace: {
    warm: ['Vas un poquito más rápido que el mes, {name}. Con calma llegamos a fin de mes.', 'Cuidado con el ritmo, {name}: el mes aún tiene días por delante.'],
    formal: ['Su ritmo de gasto supera al del calendario. Recomiendo contener las compras.', 'Gasta usted más deprisa de lo que avanza el mes.'],
    witty: ['Corres más que el calendario, {name}. El mes aún no ha terminado, ¿sabes?', 'A este ritmo, a mediados de mes ya vamos en la ruina. Tú sabrás.'],
  },
  big: {
    warm: ['Uy, {amount} de golpe en {concept}. Espero que haya valido la pena, {name}.', '{amount} en {concept}... espero que te haga muy feliz.'],
    formal: ['Se registra un gasto de {amount} en {concept}. Notable.', 'Gasto de {amount} en {concept}: queda anotado.'],
    witty: ['{amount} en {concept}... a ver, cuéntame, {name}, ¿qué estás tramando?', '¿{amount} en {concept}? Me estoy poniendo las gafas para comprobarlo.'],
  },
  streak: {
    warm: ['{days} días sin gastar nada. ¡Eso es disciplina, {name}!', '¡{days} días sin gastar! Estoy orgullosa de ti, {name}.'],
    formal: ['Lleva {days} días sin gastos. Encomiable.', '{days} días sin movimientos. Un ejemplo de prudencia.'],
    witty: ['{days} días sin gastar. ¿Estás enfermo o es que me tienes miedo, {name}?', '{days} días sin gastar... ¿te han robado la tarjeta?'],
  },
};

const ALERTS = {
  watch: {
    warm: ['Has llegado al {pct}% de {category}. Ojito, {name}.'],
    formal: ['{category} alcanza el {pct}% del presupuesto.'],
    witty: ['{category} al {pct}%... lo estoy viendo, {name}.'],
  },
  over: {
    warm: ['Te has pasado en {category} ({pct}%). Vamos a frenar un poco, {name}.'],
    formal: ['{category} supera su presupuesto ({pct}%).'],
    witty: ['{category} al {pct}%. Esto ya es una afrenta personal, {name}.'],
  },
  overall: {
    warm: ['Hemos superado el presupuesto total del mes ({over} de más). Respira, {name}.'],
    formal: ['El gasto total supera el presupuesto mensual en {over}.'],
    witty: ['Presupuesto total reventado por {over}. Aplausos, {name}.'],
  },
};

const GOALS = {
  contrib: {
    warm: ['¡Muy bien, {name}! "{goal}" ya va por el {pct}%.'],
    formal: ['Aportación registrada. "{goal}" alcanza el {pct}%.'],
    witty: ['"{goal}" al {pct}%. Mira tú, ahorrando y todo.'],
  },
  done: {
    warm: ['¡Lo conseguimos, {name}! "{goal}" completado. ¡Qué orgullo!'],
    formal: ['Objetivo "{goal}" cumplido. Mis felicitaciones.'],
    witty: ['"{goal}" cumplido. Y yo que no daba un duro por ti, {name}.'],
  },
};

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const pick = (list, seed) => list[hash(String(seed)) % list.length];

/** Rellena {variables}; si no hay nombre, quita también la coma que lo acompaña. */
export function fill(template, vars = {}) {
  let out = template;
  if (!String(vars.name ?? '').trim()) {
    out = out.replace(/,\s*\{name\}/g, '').replace(/\{name\},\s*/g, '').replace(/\s*\{name\}/g, '');
  }
  out = out.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
  out = out.replace(/\s+/g, ' ').replace(/\s+([.,!?])/g, '$1').trim();
  return out.charAt(0).toUpperCase() + out.slice(1);
}

const MOOD_BY_SITUATION = {
  empty: 'happy',
  great: 'happy',
  ok: 'happy',
  streak: 'happy',
  watch: 'watchful',
  pace: 'watchful',
  big: 'watchful',
  over: 'stern',
  overall: 'stern',
};

function worstCategory(summary, minPct) {
  let worst = null;
  for (const c of summary.perCategory) {
    if (c.pct !== null && c.pct >= minPct && (!worst || c.pct > worst.pct)) worst = c;
  }
  return worst;
}

/** Elige la situación del mes (por prioridad) y la frase de Engra. */
export function engraVoice({ summary, tone = 'warm', name = '', now = new Date() }) {
  const t = TONES[tone] ? tone : 'warm';
  let situation = 'ok';
  let vars = { name };

  const overCat = worstCategory(summary, 1);
  const watchCat = worstCategory(summary, 0.8);
  const big = summary.biggest;
  const recentBig =
    big &&
    summary.isCurrent &&
    now - new Date(big.date) < 2 * 86400000 &&
    big.amount >= Math.max(80, summary.avgExpense * 2.5);

  if (summary.count === 0) {
    situation = 'empty';
  } else if (summary.budget > 0 && summary.total > summary.budget) {
    situation = 'overall';
    vars = { name, over: formatSmart(summary.total - summary.budget) };
  } else if (overCat) {
    situation = 'over';
    vars = { name, category: overCat.name, over: formatSmart(overCat.spent - overCat.budget) };
  } else if (watchCat) {
    situation = 'watch';
    vars = { name, category: watchCat.name, pct: Math.round(watchCat.pct * 100) };
  } else if (summary.dayOfMonth >= 5 && summary.pctSpent > summary.pctElapsed + 0.15) {
    situation = 'pace';
  } else if (recentBig) {
    situation = 'big';
    vars = { name, amount: formatSmart(big.amount), concept: big.concept || 'ese capricho' };
  } else if (summary.isCurrent && summary.streak >= 2 && summary.count > 0) {
    situation = 'streak';
    vars = { name, days: summary.streak };
  } else if (summary.dayOfMonth >= 5 && summary.pctSpent < summary.pctElapsed - 0.12) {
    situation = 'great';
  }

  const list = LINES[situation][t];
  const text = fill(pick(list, `${toInputDate(now)}-${situation}-${t}-${list.length}`), vars);
  return { situation, mood: MOOD_BY_SITUATION[situation], text };
}

/** Aviso tras apuntar un gasto. kind: 'watch' | 'over' | 'overall'. */
export function alertVoice({ kind, tone = 'warm', name = '', category = '', pct = 0, over = 0, seed = '' }) {
  const t = TONES[tone] ? tone : 'warm';
  const list = ALERTS[kind][t];
  return fill(pick(list, `${seed}-${kind}-${t}`), { name, category, pct: Math.round(pct * 100), over: formatSmart(over) });
}

export function goalVoice({ kind, tone = 'warm', name = '', goal = '', pct = 0 }) {
  const t = TONES[tone] ? tone : 'warm';
  const list = GOALS[kind][t];
  return fill(pick(list, `${goal}-${kind}-${t}`), { name, goal, pct: Math.round(pct * 100) });
}

export function moodForStatus(status) {
  if (status === 'over') return 'stern';
  if (status === 'watch') return 'watchful';
  return 'happy';
}
