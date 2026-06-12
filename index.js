/** In-memory counter incremented from the application window via POST. */
let clickCount = 0;

/**
 * @param {Record<string, unknown> | undefined} query
 * @returns {{ success: false; message: string } | null}
 */
const requirePageToken = query => {
  if (query?.token !== data.token) {
    return { success: false, message: 'Unauthorized' };
  }
  return null;
};

network.endpoints.create('params', 'GET', 'onGetParams');
events.On('onGetParams', ({ query }) => {
  const denied = requirePageToken(query);
  if (denied) {
    return denied;
  }
  return api.config.getParams();
});

network.endpoints.create('state', 'GET', 'onGetState');
events.On('onGetState', ({ query }) => {
  const denied = requirePageToken(query);
  if (denied) {
    return denied;
  }

  const params = api.config.getParams();
  const maxRandom = Math.max(1, Math.floor(Number(params.maxRandom) || 999));

  return {
    label: params.label,
    randomValue: random.number(0, maxRandom),
    clickCount,
    showTimestamp: Boolean(params.showTimestamp),
    refreshedAt: Date.now(),
  };
});

network.endpoints.create('increment', 'POST', 'onIncrement');
events.On('onIncrement', ({ query, body }) => {
  const denied = requirePageToken(query);
  if (denied) {
    return denied;
  }

  const delta = Math.max(1, Math.floor(Number(body?.delta) || 1));
  clickCount += delta;

  return {
    success: true,
    clickCount,
  };
});

GenerateConfig([
  {
    key: 'label',
    type: 'text',
    default: 'Example application',
    editor: {
      label: {
        en: 'Title',
        ru: 'Заголовок',
        uk: 'Заголовок',
      },
      description: {
        en: 'Shown at the top of the application window.',
        ru: 'Отображается вверху окна приложения.',
        uk: 'Відображається вгорі вікна додатку.',
      },
    },
  },
  {
    key: 'maxRandom',
    type: 'number',
    default: 999,
    editor: {
      label: {
        en: 'Random max',
        ru: 'Максимум случайного числа',
        uk: 'Максимум випадкового числа',
      },
      min: 1,
      max: 999999,
    },
  },
  {
    key: 'accentColor',
    type: 'color',
    default: '#3b82f6',
    editor: {
      label: {
        en: 'Accent color',
        ru: 'Акцентный цвет',
        uk: 'Акцентний колір',
      },
    },
  },
  {
    key: 'refreshInterval',
    type: 'number',
    default: 2,
    editor: {
      label: {
        en: 'Refresh interval (sec)',
        ru: 'Интервал обновления (сек)',
        uk: 'Інтервал оновлення (сек)',
      },
      description: {
        en: 'How often the window polls random value from the worker.',
        ru: 'Как часто окно запрашивает случайное число у воркера.',
        uk: 'Як часто вікно запитує випадкове число у воркера.',
      },
      min: 1,
      max: 60,
    },
  },
  {
    key: 'showTimestamp',
    type: 'boolean',
    default: true,
    editor: {
      label: {
        en: 'Show last refresh time',
        ru: 'Показывать время обновления',
        uk: 'Показувати час оновлення',
      },
    },
  },
]);
