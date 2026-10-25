export function computeMood(categories) {
  const withBudget = categories.filter((c) => c.budget > 0);

  if (withBudget.length === 0) {
    return { mood: 'happy', message: 'Aún no has puesto objetivos de gasto. ¡Vamos a ello!' };
  }

  const worst = withBudget.reduce(
    (acc, c) => {
      const ratio = c.spent / c.budget;
      return ratio > acc.ratio ? { ratio, category: c } : acc;
    },
    { ratio: -Infinity, category: null }
  );

  const { ratio, category } = worst;

  if (ratio >= 1) {
    return {
      mood: 'stern',
      message: `Te has pasado del presupuesto en ${category.name}. Vamos a vigilarlo de cerca.`,
    };
  }
  if (ratio >= 0.8) {
    return {
      mood: 'watchful',
      message: `Ojo con ${category.name}: ya llevas el ${Math.round(ratio * 100)}% del presupuesto.`,
    };
  }
  return {
    mood: 'happy',
    message: 'Vas bien este mes. Sigue así.',
  };
}
