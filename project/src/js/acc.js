import { el, setChildren, mount, unmount } from 'redom';
import CardInfo from 'card-info';
import '../scss/components/_acc.scss';
import {
  BigTile,
  Formy,
  Dropdown,
  ChartBalance,
  Hystory,
  Drag,
} from './components/components';
import Top from './components/top';
import Main from './components/main';
import { getAccountData, transferFunds } from './components/api_methods';
import {
  checkLS,
  getTransactionsForBars,
  sortFunc,
  renderDataForTable,
} from './funcs/funcs';
import { getImg } from './funcs/logo';
//import Inputmask from 'inputmask';

// создать main для страницы Просмотр счёта
export default async function renderPage() {
  const main = await new AccMain('acc').init();
  return main;
}

// Класс Верхняя часть: заголовок, кнопка назад, номер счёта, баланс
export class AccTop extends Top {
  constructor() {
    super();

    this.CLASSES = {
      topline: `topline ${this.page}-topline`,
      title: `${this.page}__name ${this.page}-page__item text-reset`,
      balance: `${this.page}__balance balance`,
      balance_title: 'balance__title tile__title',
      balance_value: 'balance__value',
      accline: 'acc',
      tileTitle: `h4.${this.page}-tile__title text-reset`,
      dropdown: `dropdown ${this.page}-dropdown`,
      dropdownBtn: `dropdown__btn ${this.page}-dropdown__btn`,
    };
    this.createTitle('Просмотр счёта');
  }

  // создать полосу с заголовком и кнопкой Назад
  createTopLine() {
    const topLine = el(`div.${this.CLASSES.topline}`);
    this.createBtn('Вернуться назад', 'arrow');

    this.btn.addEventListener('click', () => {
      const url = window.location.origin;
      history.pushState({}, '', `${url}/accounts`);
      location.href = '';
      window.history.back();
    });

    this.btn.addEventListener('click', () => {
      window.history.back();
    });

    setChildren(topLine, this.title, this.btn);
    return topLine;
  }

  // создать полосу с Номером счёта и Балансом
  createAccLine(summ = '0 ₽') {
    const accLine = el(`div.${this.CLASSES.accline}`);
    const title = el(
      `h3.${this.CLASSES.title}`,
      `№ ${window.location.search.replace('?', '')}`
    );
    const balance = el(`div.${this.CLASSES.balance}`);
    const balance_title = el(`span.${this.CLASSES.balance_title}`, 'Баланс');
    const balance_value = el(
      `span.${this.CLASSES.balance_value}`,
      this.formatter_currency.format(summ)
    );
    setChildren(balance, balance_title, balance_value);
    setChildren(accLine, title, balance);
    return accLine;
  }

  // создать верхнюю часть, стостояющую из двух полос: Заголовок + кнопка Назад и Номер счёта + Баланс
  createTop(summ) {
    const top = this.createTopLine();
    const acc = this.createAccLine(summ);

    setChildren(this.top, top, acc);
    return this.top;
  }
}

// Класс main для страницы Просмотр счёта
class AccMain extends Main {
  constructor(page) {
    super(page);
    this.CLASSES = {
      grid: `${this.page}-grid`,
      form: `form ${this.page}-form`,
      label: `form__item ${this.page}-form__item--`,
      input: `input form__input`,
      addBtn: `btn btn-reset btn-primary btn-small ${this.page}-form__submit`,
    };
    this.options = {};
    this.tileTypes = [
      {
        name: 'addTransaction',
        color: 'grey',
        func: this.createAddTransactionTile,
        title: 'Новый перевод',
        clickable: false,
      },
      {
        name: 'dynamics',
        color: 'white',
        func: this.createDynamicTile,
        title: 'Динамика баланса',
        clickable: true,
      },
      {
        name: 'hystory',
        color: 'grey',
        func: this.createHistoryTile,
        title: 'История переводов',
        clickable: true,
      },
    ];
  }

  // получить данные с информацией по счёту, данные приходят от сервера
  async getData() {
    const response = await getAccountData();
    return response;
  }

  // создать плитку Новый перевод
  createAddTransactionTile() {
    const formy = new AccForm('acc');
    const form = formy.init();
    return { element: form, className: 'form', class: formy };
  }

  // создать плитку Динамика баланса (диаграмма)
  createDynamicTile(data) {
    const transactions = getTransactionsForBars({
      data: data,
      num: 6,
    });

    const chart = new ChartBalance('acc');
    const element = chart.init(transactions);

    return { element, className: 'chart', class: chart };
  }

  // создать плитку История переводов (таблица)
  createHistoryTile(data) {
    const table = new Hystory('acc');
    const trLen = Math.min(10, data.transactions.length);

    const dataToTable = renderDataForTable(data.transactions.slice(-trLen));

    const element = table.init({ data: dataToTable });

    return { element, className: 'table', class: table };
  }

  // создать плитки с параметрами, описанными в this.tileTypes
  async renderAccTiles() {
    const response = await getAccountData();
    const data = response.data;

    const tiles = this.tileTypes.map((tile) => {
      const func = tile.func;
      const funcResult = func(data);
      const inner = funcResult.element;

      this.options[funcResult.className] = funcResult.class;

      const outer = new AccTile(
        this.page,
        `${tile.color} ${this.page}-grid__${tile.name}`,
        tile.title
      );
      setChildren(outer.wrapper, inner);

      const element = outer.createElement();
      if (tile.clickable) {
        element.addEventListener('click', async () => {
          const url = window.location.origin;
          const id = window.location.search.replace('?', '');
          history.pushState({}, '', `${url}/hystory?${id}`);
          location.href = '';
        });
      }

      return element;
    });

    return tiles;
  }

  // создать элементы страницы: верхняя часть и сетка для main
  async createElements() {
    const response = await this.getData();

    const top = new AccTop();
    this.top = top.createTop(response.data.balance);
    this.btn = top.btn;

    this.grid.classList.add(`${this.CLASSES.grid}`);
    const tiles = await this.renderAccTiles();
    setChildren(this.grid, tiles);
    setChildren(this.container, this.top, this.grid);

    new Drag('acc').init(this.grid);
  }

  // инициировать создание элемента, вернуть готовый элемент
  async init() {
    await this.createElements();
    this.options.form.renewChart = this.options.chart.fill;
    this.options.form.renewTable = this.options.table.fill;
    return this.container;
  }
}

// класс Плитка для страницы Просмотр счёта
class AccTile extends BigTile {
  constructor(page, color, title) {
    super(page, color);
    this.title = el(`${this.CLASSES.title}`, title);
    this.wrapper = el(`div.${this.CLASSES.wrapper}`);
    this.elem = setChildren(this.classElem, this.title, this.wrap);
  }

  // вернуть плитку, DOM без функционала
  createElement() {
    setChildren(this.classElem, this.title, this.wrapper);
    return this.classElem;
  }
}

// класс Форма для Нового перевода
export class AccForm extends Formy {
  constructor(page) {
    super(page);
    this.inputTypes = [
      {
        name: 'number',
        type: 'text',
        label: 'Номер счёта получателя',
        placeholder: '0000 0000 0000 0000',
        hasDropdown: true,
        errMess: 'длина 26 символов',
        hasIcon: 'true',
      },
      {
        name: 'summ',
        type: 'digit',
        label: 'Сумма перевода',
        placeholder: '0.00',
        errMess: 'число больше 0',
      },
    ];
    this.btnSubmitText = 'Отправить';
  }

  // определить и добавить в инпут логотип платёжной системы
  defineLogo(isValid, value) {
    const container = document.querySelector('[data-form-path="number"]');
    const img = document.querySelector('.bank-brand');

    if (img) {
      unmount(container, img);
    }

    if (isValid) {
      const cardInfo = new CardInfo(value, {
        brandsLogosPath: '../assets/banklogos/',
      });

      if (cardInfo.numberLengths.includes(value.length)) {
        const svg = getImg(cardInfo.brandAlias);

        if (svg) {
          mount(container, svg);
        }
      }
    }
  }

  // проверка валидности вводимых данных: номер счёта и сумма
  is_valid({ value, type }) {
    const valueWithoutSpace = value.split(' ').join('');
    let test;
    if (type == 'number') {
      const regexp = new RegExp(/^\d{10,26}$/g);
      test = regexp.test(valueWithoutSpace);

      this.defineLogo(test, valueWithoutSpace);
    } else if (type == 'summ') {
      const regexp = new RegExp(/^[0-9]*[.,]?[0-9]+$/);
      test = regexp.test(value);
    }
    return test;
  }

  // для input номер счёта добавить в поле выбранное значение из выпадающего списка
  setInputValue(text) {
    const input = document.querySelector('input[name = "number"]');
    this.from = input;
    input.value = text;
    this.onBlur({ parent: input.parentElement, input });
  }

  // если ошибка, вернуть сообщение (в зависимости от ошибки)
  onError(type) {
    let elem_type;
    let text;

    switch (type) {
      case 'Invalid account to':
        elem_type = 'number';
        text = 'Счёт не найден';
        break;
      case 'Invalid amount':
        elem_type = 'summ';
        text = 'Некорректная сумма';
        break;
      case 'Overdraft prevented':
        elem_type = 'summ';
        text = 'Средств недостаточно';
        break;
      default:
        break;
    }
    return { type: elem_type, text };
  }

  // проверить существует ли уже номер в списке (для списка счетов)
  checkIfNumberExists(arr, number) {
    return arr.some(function (el) {
      return el.text === number;
    });
  }

  // подготовить и направить запрос серверу, если ответ успешный, то добавить номер счёта в LocalStorage
  async onRequest() {
    const formData = new FormData(this.form);
    //const accountTo = formData.get('number').split(' ').join('');
    const response = await transferFunds({
      from: window.location.search.replace('?', ''),
      to: formData.get('number'),
      amount: formData.get('summ'),
    });
    console.log(response);

    if (response.error != '') {
      return response;
    }

    const recipientsLS = checkLS('recipients');

    const from = document.querySelector('input[name = "number"]').value;

    if (!recipientsLS) {
      localStorage.setItem(
        'recipients',
        JSON.stringify([{ name: 'from', text: from }])
      );
    } else if (!this.checkIfNumberExists(recipientsLS, from)) {
      recipientsLS.push({ name: 'from', text: from });
      localStorage.setItem('recipients', JSON.stringify(recipientsLS));
    }

    this.balance = response.payload.balance;
    return response;
  }

  // обработать данные, полученные от сервера, добавить их на страницу
  async onResponse() {
    const response = await getAccountData();

    const transactions = getTransactionsForBars({
      data: response.data,
      num: 6,
    });
    const elements = this.renewChart(transactions);

    const balance = document.querySelector('.balance__value');
    const bars = document.querySelector('.plotArea');
    const axisY = document.querySelector('.axisY').lastElementChild;

    const tbody = document.querySelector('tbody');
    const trLen = Math.min(10, response.data.transactions.length);
    const dataToTable = sortFunc(
      response.data.transactions.slice(-trLen),
      false
    );
    const rows = this.renewTable(dataToTable);

    setChildren(bars, elements.bars);
    setChildren(tbody, rows);
    axisY.textContent = this.formatter_number.format(this.balance);
    balance.textContent = this.formatter_currency.format(this.balance);
  }

  // событие выбора элемента в выпадающшем списке Номера счетов
  setOnChooseEvent() {
    this.droppy.dropBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setInputValue(btn.textContent);
        this.droppy.closeMenu();
      });
    });
  }

  // инициировать создание формы, вернуть готовый элемент
  init() {
    this.createForm({
      btnText: this.btnSubmitText,
      svg: 'envelope',
      onSubmit: this.onSubmit,
    });

    this.inputs.forEach((el) => {
      const input = el.querySelector('input');

      // if (input.name == 'number') {
      //   const masky = new Inputmask('9999 9999 9999 9999 9999', {
      //     placeholder: '0000 0000 0000 0000 0000',
      //   });
      //   masky.mask(input);
      // }

      const confirmBtn = el.querySelector(`.${this.CLASSES.handlerConfirm}`);
      input.addEventListener('change', (e) => {
        this.onBlur({
          parent: e.currentTarget.parentElement,
          input: e.currentTarget,
        });
      });
      input.addEventListener('input', () => this.droppy.closeMenu());
      confirmBtn.addEventListener('click', () => this.droppy.closeMenu());
    });

    this.dropdowns.forEach((drop) => {
      if (drop.dataset.formPath == 'number') {
        const dropdownWrap = drop;
        const dropdownTrigger = dropdownWrap.firstChild;

        this.droppy = new AccDrop('acc', dropdownWrap);

        dropdownWrap.classList.add('dropdown');
        dropdownTrigger.classList.add('dropdown__btn');
        this.droppy.init(dropdownTrigger);

        this.droppy.btn.addEventListener('click', () =>
          this.setOnChooseEvent()
        );
      }
    });

    return this.form;
  }
}

// класс Выпадающее меню для Просморта счета
class AccDrop extends Dropdown {
  constructor(page, element) {
    super(page, element);
    this.btnLabel = 'Сортировка';
  }

  // получить список элементов для меню
  getDropItems() {
    const data = checkLS('recipients');
    if (!data) {
      return [{ name: 'empty', text: 'Здесь пока пусто :)' }];
    }
    return data;
  }
}
