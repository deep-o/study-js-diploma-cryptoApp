const METHODS = {
  getLogin: 'http://localhost:3000/login',
  getAccounts: 'http://localhost:3000/accounts',
  getAccount: 'http://localhost:3000/account',
  createAccount: 'http://localhost:3000/create-account',
  trunsfer: 'http://localhost:3000/transfer-funds',
  getAllCurrencies: 'http://localhost:3000/all-currencies',
  getClientCurrencies: 'http://localhost:3000/currencies',
  buyCurrencies: 'http://localhost:3000/currency-buy',
  websocket: 'http://localhost:3000/currency-feed',
  getBanks: 'http://localhost:3000/banks',
};

// отправлеяет серверу логин и пароль, получает токен
export async function getUserTocken(userLogin, userPassword) {
  return await fetch(METHODS.getLogin, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      login: userLogin,
      password: userPassword,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      return { data: res.payload, error: res.error };
    });
}

// получить параметры для запроса на сервер: метод, header, body
function getOptionsForRequest({ r_method, r_body }) {
  const token = JSON.parse(localStorage.getItem('token'));
  let r_header;

  if (r_method == 'GET') {
    r_header = {
      authorization: `Basic ${token}`,
    };
  } else if (r_method == 'POST') {
    r_header = {
      'Content-Type': 'application/json',
      authorization: `Basic ${token}`,
    };
  }

  const options = {
    method: r_method,
    headers: r_header,
    body: JSON.stringify(r_body),
  };

  return options;
}

// добавить ответ в кэш
async function addDataToCache({ url }) {
  const cache = await caches.open('my-cache');
  const options = getOptionsForRequest({ r_method: 'GET' });

  cache.add(new Request(url, options));
}

// получить данные из кэша
export async function getDataFromCache() {
  const url = METHODS.getAccounts;
  const cache = await caches.open('my-cache');
  const options = getOptionsForRequest({ r_method: 'GET' });
  const response = await cache.match(url, options).then((res) => {
    return res;
  });

  if (response) {
    const data = await response.json().then((res) => {
      return res;
    });

    return { data: data.payload, error: data.error };
  } else {
    return false;
  }
}

// сделать запрос на сервер
async function makeRequest({ url, r_method, r_body }) {
  const options = getOptionsForRequest({ r_method, r_body });

  return await fetch(url, options).then((res) => {
    return res.json();
  });
}

// отправить запрос на сервер для создания нового аккаунта
export async function createNewAccount() {
  const res = await makeRequest({
    url: METHODS.createAccount,
    r_method: 'POST',
  });
  addDataToCache({ url: METHODS.getAccounts });
  return { data: res.payload, error: res.error };
}

// получить от сервера список счетов
export async function getAccountsData() {
  const res = await makeRequest({ url: METHODS.getAccounts, r_method: 'GET' });
  addDataToCache({ url: METHODS.getAccounts });
  return { data: res.payload, error: res.error };
}

// получить от сервера данные аккаунта
export async function getAccountData() {
  const id = window.location.search.replace('?', '');
  const res = await makeRequest({
    url: `${METHODS.getAccount}/${id}`,
    r_method: 'GET',
  });
  return { data: res.payload, error: res.error };
}

// отправить на сервер запрос для перевода средств со счёта на счёт
export async function transferFunds(data) {
  console.log(data);
  return await makeRequest({
    url: METHODS.trunsfer,
    r_method: 'POST',
    r_body: data,
  });
}

// получить от сервера массив со списком кодов всех используемых бекэндом валют на данный момент
export async function getAllCurrencies() {
  const res = await makeRequest({
    url: METHODS.getAllCurrencies,
    r_method: 'GET',
  });
  return { data: res.payload, error: res.error };
}

// получить от сервера список валютных счетов пользователя
export async function getClientCurrencies() {
  const res = await makeRequest({
    url: METHODS.getClientCurrencies,
    r_method: 'GET',
  });
  return { data: res.payload, error: res.error };
}

// отправить на сервер запрос для осуществления валютного обмена
export async function buyCurrencies(data) {
  return await makeRequest({
    url: METHODS.buyCurrencies,
    r_method: 'POST',
    r_body: data,
  });
}

// трансформировать данные в формат json
function parseSocketData(data) {
  return JSON.parse(data);
}

// удалить последний элемент из списка, вставить в ачало списка новый элемент
function addElement(parent, child) {
  if (parent.childNodes.length > 30) {
    parent.lastChild.remove();
  }
  parent.prepend(child);
}

// отправить запрос на сервер, получить данные от websocket, добавить строку в таблицу
export async function currencyFeed(method, table) {
  const socket = new WebSocket('ws://localhost:3000/currency-feed');
  socket.onopen = function () {
    console.log('[socket] Соединение установлено');
  };

  socket.onmessage = function (event) {
    const rate = parseSocketData(event.data);
    const row = method({
      code: `${rate.from}/${rate.to}`,
      amount: rate.rate,
      change: rate.change,
    });

    addElement(table, row);
  };
}

// получить от сервера список точек, отмечающих места банкоматов
export async function getBanks() {
  const res = await makeRequest({
    url: METHODS.getBanks,
    r_method: 'GET',
  });
  return { data: res.payload, error: res.error };
}
