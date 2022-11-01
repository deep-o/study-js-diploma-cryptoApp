import { el, setChildren } from 'redom';
import '../scss/components/_currencies.scss';
import {
  BigTile,
  CurTable,
  Formy,
  Dropdown,
  Drag,
} from './components/components';
import Top from './components/top';
import Main from './components/main';
import {
  getClientCurrencies,
  getAllCurrencies,
  buyCurrencies,
  currencyFeed,
} from './components/api_methods';
import { checkLS } from './funcs/funcs';

// создать main для страницы Валюты
export default async function renderPage() {
  const main = await new CurMain('currencies').init();
  return main;
}

// Класс Верхняя часть: заголовок
class CurTop extends Top {
  constructor() {
    super();

    this.createTitle('Валютный обмен');
  }

  // создать полосу с заголовком
  createTopLine() {
    const topLine = el(`div.${this.CLASSES.topline}`);

    setChildren(topLine, this.title);
    return topLine;
  }

  // создать верхнюю часть, стостояющую одной полосы: Заголовок
  createTop() {
    const top = this.createTopLine();

    setChildren(this.top, top);
    return this.top;
  }
}

// Класс main для страницы Просмотр счёта
class CurMain extends Main {
  constructor(page) {
    super(page);
    this.CLASSES = {
      grid: `${this.page}-page__grid`,
      form: `form ${this.page}-form`,
      label: `form__item ${this.page}-form__item--`,
      input: `input form__input`,
      addBtn: `btn btn-reset btn-primary btn-small ${this.page}-form__submit`,
      curTable: `cur-table`,
    };
    this.options = {};
    this.tileTypes = [
      {
        name: 'yourCurrencies',
        color: 'white',
        func: this.createYourCurrenciesTile,
        title: 'Ваши валюты',
      },
      {
        name: 'exchRates',
        color: 'grey',
        func: this.createexchRatesTile,
        title: 'Изменение курсов в реальном времени',
      },
      {
        name: 'exchange',
        color: 'white',
        func: this.createExchangeTile,
        title: 'Обмен валюты',
      },
    ];
  }

  //создать плитку Ваши валюты
  createYourCurrenciesTile(data) {
    const table = new CurTable('currencies', 'c-table');
    const element = table.init(data);
    return { element: element, className: 'table', class: table };
  }

  // создат плитку Обмен валюты с формой
  createExchangeTile() {
    const formy = new CurForm('currencies');
    const form = formy.init();
    return { element: form, className: 'form', class: formy };
  }

  // создать плитку Изменение курсов в реальном времени
  createexchRatesTile() {
    const table = new CurTable('currencies', 'r-table');
    const element = table.init();
    return { element: element, className: 'rates', class: table };
  }

  // получить список валют, сохранить в LocalStorage
  async getCurrencies() {
    const currencies = await getAllCurrencies();
    const curLS = currencies.data.map((code) => {
      return { name: 'currency', text: code, default: '' };
    });

    localStorage.setItem('currencies', JSON.stringify(curLS));
  }

  // создать плитку по списку this.tyleTypes
  async renderAccTiles() {
    await this.getCurrencies();

    const response = await getClientCurrencies();
    const data = response.data || '';

    const tiles = this.tileTypes.map((tile) => {
      const func = tile.func;
      const funcResult = func(data);
      const inner = funcResult.element;

      this.options[funcResult.className] = funcResult.class;

      const outer = new CurTile(
        this.page,
        `${tile.color} ${this.page}-grid__${tile.name}`,
        tile.title
      );
      setChildren(outer.wrapper, inner);

      const element = outer.createElement();

      return element;
    });

    return tiles;
  }

  // создать DOM, добавить опцию перетаскивания
  async createElements() {
    //const response = await this.getData();

    const top = new CurTop();
    this.top = top.createTop();
    this.btn = top.btn;

    this.grid.classList.add(`${this.CLASSES.grid}`);
    const tiles = await this.renderAccTiles();
    setChildren(this.grid, tiles);
    setChildren(this.container, this.top, this.grid);

    new Drag('currencies').init(this.grid);
  }

  // инциализировать создание страницы, вернуть готовый элемент
  async init() {
    await this.createElements();
    this.options.form.renewTable = this.options.table.fill;
    currencyFeed(this.options.rates.addRow, this.options.rates.table);
    return this.container;
  }
}

// плитка для страницы Валюты
class CurTile extends BigTile {
  constructor(page, color, title) {
    super(page, color);
    this.title = el(`${this.CLASSES.title}`, title);
    this.wrapper = el(`div.${this.CLASSES.wrapper}`);
    this.elem = setChildren(this.classElem, this.title, this.wrap);
  }

  // создать DOM
  createElement() {
    setChildren(this.classElem, this.title, this.wrapper);
    return this.classElem;
  }
}

// класс Форма для обмена валюты
class CurForm extends Formy {
  constructor(page) {
    super(page);
    this.inputTypes = [
      {
        name: 'from',
        type: 'text',
        label: 'из',
        placeholder: 'code',
        hasDropdown: true,
        errMess: 'no',
      },
      {
        name: 'to',
        type: 'text',
        label: 'в',
        placeholder: 'code',
        hasDropdown: true,
        errMess: 'no',
      },
      {
        name: 'amount',
        type: 'digit',
        label: 'Сумма',
        placeholder: '0',
        errMess: 'число больше 0',
      },
    ];
    this.btnSubmitText = 'Обменять';
    this.droppies = [];
  }

  // получить выпадающий список для кодов валют
  getDropItems() {
    const curFromLS = checkLS('currencies') || [];
    const curList = curFromLS.map((item) => {
      return item.text;
    });
    return curList;
  }

  // проверка на валидность вводимых значений
  is_valid({ value, type }) {
    let test;
    if (type == 'from' || type == 'to') {
      const curList = this.getDropItems();
      test = curList.includes(value);
      //const regexp = new RegExp(/^\w{3,4}$/g);
    }
    if (type == 'amount') {
      const regexp = new RegExp(/^[0-9]*[.,]?[0-9]+$/);
      test = regexp.test(value);
    }
    return test;
  }

  // установить значение в инпут при выборе из выпадающего списка
  setInputValue({ element, text }) {
    element.value = text;
    this.onBlur({ parent: element.parentElement, input: element });
  }

  // вывести сообщение об ошибке
  onError(type) {
    let elem_type;
    let text;

    switch (type) {
      case '`Unknown currency code':
        elem_type = 'number';
        text = 'Неизвестная валюта';
        break;
      case 'Invalid amount':
        elem_type = 'amount';
        text = 'Некорректная сумма';
        break;
      case 'Not enough currency':
        elem_type = 'amount';
        text = 'На счёту нет средств';
        break;
      case 'Overdraft prevented':
        elem_type = 'amount';
        text = 'Средств недостаточно';
        break;
      default:
        break;
    }
    return { type: elem_type, text };
  }

  // сформировать и направить запрос
  async onRequest() {
    const formData = new FormData(this.form);
    const response = await buyCurrencies({
      from: formData.get('from'),
      to: formData.get('to'),
      amount: formData.get('amount'),
    });

    if (response.error != '') {
      return response;
    }

    return response;
  }

  // при получении ответа от сервера обновить/добавить строки в таблицах
  async onResponse(data) {
    const table = document.querySelector('.c-table');
    const rows = this.renewTable(data);
    setChildren(table, rows);
  }

  // событие при выборе элемента из выпадающего списка
  setOnChooseEvent(el) {
    el.dropBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setInputValue({ element: el.btn, text: btn.textContent });
        el.closeMenu();
      });
    });
  }

  // создать выпадающий список
  createDropdown(drop) {
    const dropdownWrap = drop;
    const dropdownTrigger = dropdownWrap.firstChild;

    const dropdown = new CurDrop('currencies', dropdownWrap);

    dropdownWrap.classList.add('dropdown');
    dropdownTrigger.classList.add('dropdown__btn');
    dropdown.init(dropdownTrigger);

    dropdown.btn.addEventListener('click', () => {
      this.setOnChooseEvent(dropdown);
    });
    this.droppies.push(dropdown);
  }

  // инициализировать создание формы и вернуть готовый элемент
  init() {
    this.createForm({
      btnText: this.btnSubmitText,
      onSubmit: this.onSubmit,
    });

    this.inputs.forEach((el) => {
      const input = el.querySelector('input');
      const confirmBtn = el.querySelector(`.${this.CLASSES.handlerConfirm}`);
      input.addEventListener('change', (e) => {
        this.onBlur({
          parent: e.currentTarget.parentElement,
          input: e.currentTarget,
        });
      });
      input.addEventListener('input', () => {
        this.droppies.forEach((drop) => drop.closeMenu());
      });
      confirmBtn.addEventListener('click', () => {
        this.droppies.forEach((drop) => drop.closeMenu());
      });
    });

    this.dropdowns.forEach((drop) => {
      this.createDropdown(drop);
    });

    return this.form;
  }
}

// класс Выпадающее меню для формы Обмен валют
class CurDrop extends Dropdown {
  constructor(page, element) {
    super(page, element);
    this.btnLabel = '';
  }

  // получить список кодов валют для меню
  getDropItems() {
    const data = checkLS('currencies');
    if (!data) {
      return [{ name: 'empty', text: 'Здесь пока пусто :)' }];
    }
    return data;
  }
}
