// создать svg из коллекции в спрайте

export function createSvg(id, classes) {
  const svg = `<svg id="${id}" class="${classes}">
    <use xlink:href="./sprite.svg#${id}" />
  </svg>`;
  return svg;
}

// проверить есть ли в LocalStorage данные по ключу
export function checkLS(key) {
  const dataLS = JSON.parse(localStorage.getItem(key));
  if (dataLS) {
    return dataLS;
  } else {
    return false;
  }
}

// собрать баланс транзакций по месяцам для диаграммы
function getBalance(data, from, to) {
  let current_balance = 0;

  const months = [
    'янв',
    'фев',
    'мар',
    'апр',
    'май',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек',
  ];

  const result = data.transactions.reduce((trs, item) => {
    const date = new Date(item.date);
    if (item.from == data.account) {
      current_balance -= item.amount;
    } else if (item.to == data.account) {
      current_balance += item.amount;
    }

    if (date < to && date > from) {
      const month = months[date.getMonth()];
      trs[month] = current_balance;
    }
    return trs;
  }, {});

  return result;
}

// получить соотношение входящих/исходящих транзакций
function getRatios(data, from, to) {
  let current_balance = 0;
  const months = [
    'янв',
    'фев',
    'мар',
    'апр',
    'май',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек',
  ];

  const result = data.transactions.reduce((trs, item) => {
    const date = new Date(item.date);
    item.from == data.account
      ? (current_balance -= item.amount)
      : (current_balance += item.amount);

    if (date < to && date > from) {
      const month = months[date.getMonth()];
      const summ = trs[month] || [0, 0, 0];

      summ[2] = current_balance;
      item.from == data.account
        ? (summ[0] += item.amount)
        : (summ[1] += item.amount);

      trs[month] = summ;
    }
    return trs;
  }, {});

  return result;
}

// получить соотношение транзакций для диаграммы
export function getTransactionsForBars({ data, num = 6, split = false }) {
  const today = new Date();
  const from = new Date(today);
  from.setMonth(from.getMonth() - num);
  let trs;

  if (split) {
    trs = getRatios(data, from, today);
  } else {
    trs = getBalance(data, from, today);
  }

  return trs;
}

// функция сортировки
export function sortFunc(data, field, option = true) {
  option
    ? data.sort((a, b) => (a[field] > b[field] ? 1 : -1))
    : data.sort((a, b) => (a[field] > b[field] ? -1 : 1));
  return data;
}

// собрать данные для таблицы История переводов
export function renderDataForTable(data) {
  data.forEach((transac) => {
    if (
      transac.from == window.location.search.replace('?', '') &&
      transac.from > 0
    ) {
      transac.amount *= -1;
    }
  });

  sortFunc(data, 'date', false);
  return data;
}
