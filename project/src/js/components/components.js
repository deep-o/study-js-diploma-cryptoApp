import { el, setAttr, setChildren, mount, unmount } from 'redom';
import { createSvg, sortFunc } from '../funcs/funcs';

// класс базового компонента
class BaseComponent {
  constructor(page) {
    this.page = page;
    this.classElem = '';
    this.formatter_currency = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    });
    this.formatter_number = new Intl.NumberFormat('ru', {
      maximumFractionDigits: 0,
    });
    this.formatter_date = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  }

  // возвращает коренной элемент
  createElement() {
    const elem = this.classElem;
    return elem;
  }
}

// класс большой плитки
export class BigTile extends BaseComponent {
  constructor(page, color) {
    super(page);
    this.color = color;
    this.classElem = el(
      `div.tile tile-${this.color} ${this.page}__tile ${this.page}-tile`
    );
    this.CLASSES = {
      title: `h4.tile__title text-reset`,
      wrapper: `tile__wrapper`,
    };
  }
}

// класс скелетона
export class Skeleton extends BaseComponent {
  constructor(page) {
    super(page);
    this.CLASSES = {};
    this.tileTypes = [
      {
        color: 'grey',
      },
      {
        color: 'grey',
      },
      {
        color: 'grey',
      },
      {
        color: 'grey',
      },
    ];
  }

  //создать и вернуть плитку
  createTile(color) {
    const tile = new BigTile('skeleton', color);
    return tile.classElem;
  }

  // создать скелетон, получить готовый элемент
  init() {
    const container = el(`div.skeleton container`);
    const title = el('div.skeleton__title');
    const grid = el('div.skeleton__grid');
    const tiles = this.tileTypes.map((type) => this.createTile(type.color));

    setChildren(grid, tiles);
    setChildren(container, title, grid);

    return container;
  }
}

// класс маленькой плитки
export class SmallTile extends BaseComponent {
  constructor({ page, account, summ, date }) {
    super(page);

    this.link = new PrimaryLink(
      'account-tile',
      'Открыть',
      `/acc?${account}`
    ).createElement();

    this.classElem = el(
      'li.account-tile tile',
      el(
        'div.account-tile__top',
        el('h3.account-tile__item account-tile__number text-reset', account),
        el('p.account-tile__item account-tile__balance text-reset', summ)
      ),
      el(
        'div.account-tile__bottom',
        el(
          'div.account-tile__transaction transaction',
          el('span.transaction__text text-reset', 'Последняя транзакция'),
          el('span.transaction__date', date)
        ),
        this.link
      )
    );
    this.account = account;
    this.summ = summ;
    this.date = date;
  }
}

// класс Кнопка
export class PrimaryBtn extends BaseComponent {
  constructor(page, text) {
    super(page);
    this.text = text;
    this.classElem = el(
      `button.btn btn-reset btn-primary btn-normal ${this.page}__btn`,
      this.text
    );
  }
}

// класс Ссылка, внешне будет похожа на Кнопку
export class PrimaryLink extends BaseComponent {
  constructor(page, text, href) {
    super(page);
    this.text = text;
    this.classElem = el(
      `a.btn btn-primary btn-normal ${this.page}__link`,
      this.text
    );
    setAttr(this.classElem, { href: href });
  }
}

// класс Форма
export class Formy extends BaseComponent {
  constructor(page) {
    super(page);
    this.CLASSES = {
      form: `form ${this.page}-form`,
      wrap: `form__wrap`,
      label: `form__item ${this.page}-form__item ${this.page}-form__item--`,
      input: `input form__input`,
      btn: `btn btn-reset btn-primary btn-small ${this.page}-form__submit`,
      warning: 'warning-svg',
      filled: 'is-filled',
      valid: 'is-valid',
      hidden: 'is-hidden',
      invalid: 'is-invalid',
      submitBtn: `btn btn-reset btn-primary btn-small ${this.page}-form__btn`,
      message: `form__message`,
      mark: `form__mark`,
      thisMark: `${this.page}-form__mark`,
      spinWrap: 'spin-wrap',
      spin: 'form-spinner',
      noResp: 'err-no-response is-hidden',
      err: 'err-message',
      btnSvg: 'btn-icon__svg',
      btnIcon: 'btn-icon__icon',
      handlers: 'form__handlers',
      thisHandlers: `${this.page}-form__handlers`,
      handler: 'form__handler',
      handlerConfirm: 'handler-confirm',
      handlersSvg: 'handlers-svg',
    };
    this.dropdowns = [];
    this.api = '';
  }

  // проверка корректности введённого в инпут значения
  is_valid({ value }) {
    return value.replace(/\s+/g, '').length > 5;
  }

  // активировать/дезактивировать кнопку submit
  setBtnStatus(action) {
    const filled = document.querySelectorAll('.is-valid').length;
    const result = this.inputs.length === filled;

    if (action & result) {
      this.btn.removeAttribute('disabled');
    } else {
      this.btn.setAttribute('disabled', 'true');
    }
  }

  // подсветить инпуты: корректно/некорректно
  hightlightInput(elem, option, text) {
    let errText;
    if (text) {
      errText = text;
    } else {
      errText = this.inputTypes.find(
        (input) => input.name === elem.input.id
      ).errMess;
    }
    if (option) {
      elem.input.classList.remove(`${this.CLASSES.invalid}`);
      elem.input.classList.add(`${this.CLASSES.valid}`);
    } else {
      elem.input.classList.remove(`${this.CLASSES.valid}`);
      elem.input.classList.add(`${this.CLASSES.invalid}`);
      elem.svg.innerHTML = createSvg('warnIcon', this.CLASSES.warning);
      elem.message.innerHTML = errText;
    }
  }

  // получить из LocalStorage значение по ключу
  checkLS(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  // событие по изменению значения в input
  onChange({ element }) {
    const { value } = element;
    element.classList.remove('is-valid');
    const valid = this.is_valid({ value, type: element.name });
    if (valid) {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
    } else {
      element.classList.remove('is-valid');
      element.classList.add('is-invalid');
    }
    this.setBtnStatus(valid);
  }

  // событие по прекращению изменения значения в input и перехода к другому элементу
  onBlur({ input }) {
    const parent = input.parentElement;
    const checkIcon = parent.querySelector(`.${this.CLASSES.mark}`);
    const message = parent.querySelector(`.${this.CLASSES.message}`);

    const value = input.value;
    const valid = this.is_valid({ value, type: input.name });

    input.value = value;
    if (value == '') {
      return;
    }
    if (valid) {
      this.hightlightInput({ input, svg: checkIcon }, true);
    } else {
      this.hightlightInput({ input, svg: checkIcon, message: message }, false);
    }
    this.setBtnStatus(valid);
  }

  // событие при фокусе input
  onFocus({ element }) {
    const parent = element.parentElement;
    const icon = parent.querySelector(`.${this.CLASSES.mark}`);
    const text = parent.querySelector(`.${this.CLASSES.message}`);
    const handlers = parent.querySelector(`.${this.CLASSES.handlers}`);

    element.classList.remove(`${this.CLASSES.valid}`);
    element.classList.remove(`${this.CLASSES.invalid}`);
    handlers.classList.remove(`${this.CLASSES.hidden}`);

    icon.innerHTML = '';
    text.innerHTML = '';
  }

  /* создать: label, input, контейнер для вывода сообщений об ошибке,
  контейнер для иконки ok/error, блок кнопок подтвердить/удалить,
  добавить выпадающий список (опционально),
  список элементов в выпадающем списке получить из LocalStorage (опционально)
  добавить обработчики событий
  вернуть элементы в общем контейнере
  */
  createInput(params) {
    const label = el(`label.${this.CLASSES.label}${params.name}`, {
      'data-form-path': params.name,
    });

    const message = el(`div.${this.CLASSES.message}`, {
      'data-icon-path': params.name,
    });
    const checkIcon = el(`div.${this.CLASSES.mark} ${this.CLASSES.thisMark}`);

    const input = el(`input.${this.CLASSES.input}`, {
      id: `${params.name}`,
      type: params.type,
      placeholder: params.placeholder,
      name: params.name,
    });

    const deleteBtn = el(`button.${this.CLASSES.handler}`, { type: 'button' });
    deleteBtn.innerHTML = createSvg('delete', this.CLASSES.handlersSvg);

    const confirmBtn = el(
      `button.${this.CLASSES.handler} ${this.CLASSES.handlerConfirm}`,
      { type: 'button' }
    );
    confirmBtn.innerHTML = createSvg('confirm', this.CLASSES.handlersSvg);

    const handlers = el(
      `div.${this.CLASSES.handlers} ${this.CLASSES.thisHandlers} ${this.CLASSES.hidden}`
    );
    setChildren(handlers, deleteBtn, confirmBtn);

    if (params.hasDropdown) {
      this.dropdowns.push(label);
    }

    if (params.ls && this.checkLS(params.ls)) {
      input.value = this.checkLS(params.ls);
      input.classList.add(`${this.CLASSES.filled}`);
      this.hightlightInput({ input: input, svg: checkIcon }, true);
    }

    input.addEventListener('input', (e) =>
      this.onChange({ element: e.currentTarget })
    );

    input.addEventListener('focus', (e) =>
      this.onFocus({ element: e.currentTarget })
    );

    input.addEventListener('blur', (e) => {
      this.onBlur({ input: e.currentTarget });
    });

    document.body.addEventListener('click', (e) => {
      const withinBoundaries = e.composedPath().includes(label);

      if (!withinBoundaries) {
        handlers.classList.add('is-hidden');
      }
    });

    deleteBtn.addEventListener('click', () => {
      input.value = '';
      const img = document.querySelector('.bank-brand');

      if (img) {
        unmount(label, img);
      }
      input.focus();
    });

    confirmBtn.addEventListener('click', () => {
      this.onBlur({
        input,
      });
      handlers.classList.add('is-hidden');
    });

    setChildren(label, input, checkIcon, message, handlers);

    return label;
  }

  // создать кнопку submit
  createBtn(btnText, svgName = NaN) {
    this.btn = new PrimaryBtn(`${this.page}-form`, btnText).createElement();

    const text = el('span', btnText);
    let mark;

    if (svgName) {
      mark = el(`span.${this.CLASSES.btnSvg}`);
      const svg = createSvg(svgName, this.CLASSES.btnIcon);
      mark.innerHTML = svg;
    }

    svgName ? setChildren(this.btn, mark, text) : setChildren(this.btn, text);
    setAttr(this.btn, { disabled: true, type: 'submit' });
  }

  // событие запрос
  async onRequest() {
    return;
  }

  // событие по получению ответа на запрос
  onResponse() {
    return;
  }

  // событие submit
  onSubmit = async (el) => {
    el.preventDefault();
    try {
      this.spinner.style.display = 'flex';
      this.errNoResponse.classList.add(`${this.CLASSES.hidden}`);
      const response = await this.onRequest();

      if (response.error != '') {
        this.showError(response.error);
        return;
      }
      await this.onResponse(response.payload);
      const okMark = document.querySelectorAll('.form__mark');

      if (okMark) {
        okMark.forEach((elem) => {
          elem.innerHTML = createSvg('successIcon', this.CLASSES.warning);
        });
      }
    } catch (err) {
      console.log(err);
      this.errNoResponse.classList.remove(`${this.CLASSES.hidden}`);
    } finally {
      this.spinner.style.display = 'none';
    }
  };

  // событие при ошибке в ответе на запрос
  onError() {
    return;
  }

  // показать ошибку пользователю
  showError(type) {
    const elem = this.onError(type);

    const label = document.querySelector(
      `.${this.page}-form__item--${elem.type}`
    );
    const element = {
      input: label.querySelector('input'),
      svg: label.querySelector(`.${this.CLASSES.mark}`),
      message: label.querySelector(`.${this.CLASSES.message}`),
    };

    this.hightlightInput(element, false, elem.text);
  }

  // создать форму, установить обработчик на submit, сохранить готвой элемент формы в this.form
  createForm({ btnText, svg = NaN }) {
    this.form = el(`form.${this.CLASSES.form}`);
    this.inputs = this.inputTypes.map((inp) => this.createInput(inp));
    this.createBtn(btnText, svg);
    this.spinner = el(
      `div.${this.CLASSES.spinWrap}`,
      el(`span.${this.CLASSES.spin}`)
    );
    this.errNoResponse = el(
      `div.${this.CLASSES.noResp}`,
      el(`span.${this.CLASSES.err}`, 'ошибка запроса')
    );

    this.form.addEventListener('submit', (el) => this.onSubmit(el));

    setChildren(
      this.form,
      this.inputs,
      this.btn,
      this.spinner,
      this.errNoResponse
    );
  }
}

// класс Выпадающий список
export class Dropdown extends BaseComponent {
  constructor(page, container) {
    super(page);
    this.CLASSES = {
      dropdownItem: 'dropdown__item',
      dropdownBtn: 'dropdown__sortBtn',
      dropdownMenu: 'dropdown__menu is-hidden list-reset',
      is_hidden: 'is-hidden',
      is_open: 'is-open',
      is_checked: 'is-checked',
    };
    (this.container = container), (this.btnLabel = '');
  }

  // событие при выборе элемента списка
  onChoose(btn) {
    const prev = document.querySelector(`.${this.CLASSES.is_checked}`);
    if (prev) {
      prev.classList.remove(`${this.CLASSES.is_checked}`);
    }
    btn.firstChild.classList.toggle(`${this.CLASSES.is_checked}`);
  }

  // закрыть меню
  closeMenu() {
    this.dropdownMenu.classList.add(`${this.CLASSES.is_hidden}`);
    this.container.classList.remove(`${this.CLASSES.is_open}`);
  }

  // получить список элементов меню
  getDropItems() {
    return [];
  }

  // создать кнопки - элементы в списке-меню, добавить события на них
  createDropdownBtns() {
    this.dropBtns = this.getDropItems().map((type) => {
      const elem = el(
        `li.${this.CLASSES.dropdownItem}`,
        el(
          `button.${this.CLASSES.dropdownBtn} ${type.default}`,
          { 'data-drop': type.name, type: 'button' },
          type.text
        )
      );
      elem.addEventListener('click', (el) => this.onChoose(el.currentTarget));
      return elem;
    });

    setChildren(this.dropdownMenu, this.dropBtns);
  }

  // инициировать выпадающий список для элемента
  init(trigger) {
    this.btn = trigger;
    this.dropdownMenu = el(`ul.${this.CLASSES.dropdownMenu}`);
    this.createDropdownBtns();

    this.btn.addEventListener('click', () => {
      this.container.classList.toggle(`${this.CLASSES.is_open}`);
      this.createDropdownBtns();
      this.dropdownMenu.classList.toggle(`${this.CLASSES.is_hidden}`);
    });

    document.body.addEventListener('click', (e) => {
      const withinBoundaries = e.composedPath().includes(this.container);

      if (!withinBoundaries) this.closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.code == 'Escape') {
        this.closeMenu();
      }
    });

    mount(this.container, this.btn);
    mount(this.container, this.dropdownMenu);
  }
}

// класс Диаграмма
class Chart extends BaseComponent {
  constructor(page) {
    super(page);
    this.CLASSES = {
      chart: 'chart',
      plotArea: 'chart__plotArea plotArea',
      axisX: 'chart__axisX axis axisX',
      axisY: 'chart__axisY axis axisY',
      axisTitle: 'axis__title axisX__item',
      bar: 'chart__bar',
    };
  }

  // получить элементы для диаграммы
  renderElements() {
    return;
  }

  // создать и вернуть диаграмму: область, оси, элементы
  init(data) {
    const chart = el(`div.${this.CLASSES.chart}`);
    this.plotArea = el(`div.${this.CLASSES.plotArea}`);
    this.axisX = el(`div.${this.CLASSES.axisX}`);
    this.axisY = el(`div.${this.CLASSES.axisY}`);

    const elements = this.fill(data);
    this.renderElements(elements);

    setChildren(chart, this.plotArea, this.axisY, this.axisX);
    return chart;
  }
}

// класс Диаграмма с разбивкой на части, расширенный класс Диаграммы
export class ChartRatio extends Chart {
  // получить составляющие элементов диаграммы с разбивкой в процентном соотношении
  fill(arr) {
    const values = Object.values(arr);
    const months = Object.keys(arr);
    let maxBalance = 0;
    let maximum = 0;
    let maxPaid = 0;
    let maxRecieved = 0;

    values.forEach((pair) => {
      pair[0] + pair[1] > maximum ? (maximum = pair[0] + pair[1]) : null;
      pair[0] > maxPaid ? (maxPaid = pair[0]) : null;
      pair[1] > maxRecieved ? (maxRecieved = pair[1]) : null;
      pair[2] > maxBalance ? (maxBalance = pair[2]) : null;
    });

    const middle = (Math.min(maxRecieved, maxPaid) / maximum) * maxBalance || 0;

    const minY = el(
      'span.axis__title axisY__item axisY__item--min',
      { style: { height: Math.max((middle / maxBalance) * 100, 12) + '%' } },
      this.formatter_currency.format(0)
    );
    const midY = el(
      'span.axis__title axisY__item axisY__item--mid',
      { style: { height: 100 - (middle / maxBalance) * 100 + '%' } },
      this.formatter_currency.format(middle)
    );
    const maxY = el(
      'span.axis__title axisY__item axisY__item--max',
      this.formatter_currency.format(maxBalance)
    );

    const bars = values.map((bar) => {
      const barHeight = ((bar[0] + bar[1]) / maximum) * 100;
      const element = el('div.chart__bar', {
        style: { height: barHeight + '%' },
      });
      const bottom = el('div.chart-bar__bottom', {
        style: { height: (bar[0] / (bar[0] + bar[1])) * 100 + '%' },
      });
      const top = el('div.chart-bar__top', {
        style: { height: (bar[1] / (bar[0] + bar[1])) * 100 + '%' },
      });
      setChildren(element, top, bottom);
      return element;
    });

    const titlesX = months.map((month) => {
      return el(`span.${this.CLASSES.axisTitle}`, month);
    });

    return { minY, midY, maxY, titlesX, bars };
  }

  // собрать все части диаграммы в единый элемент
  renderElements(elements) {
    setChildren(this.axisY, elements.minY, elements.midY, elements.maxY);
    setChildren(this.axisX, elements.titlesX);
    setChildren(this.plotArea, elements.bars);
  }
}

// класс Динамика Баланса, расширенный класс Диаграммы
export class ChartBalance extends Chart {
  // получить составляющие элементов диаграммы
  fill(arr) {
    const values = Object.values(arr);
    const months = Object.keys(arr);
    const maximum =
      Math.max.apply(null, values) > 0 ? Math.max.apply(null, values) : 0;

    const minY = el(
      'span.axis__title axisY__item axisY__item--min',
      this.formatter_currency.format(0)
    );
    const maxY = el(
      'span.axis__title axisY__item axisY__item--max',
      this.formatter_currency.format(maximum)
    );

    const bars = values.map((bar) => {
      const elem = el('div.chart__bar', {
        style: { height: (bar / maximum) * 100 + '%' },
      });

      return elem;
    });

    const titlesX = months.map((month) => {
      return el(`span.${this.CLASSES.axisTitle}`, month);
    });

    return { minY, maxY, titlesX, bars };
  }

  // собрать все части диаграммы в единый элемент
  renderElements(elements) {
    setChildren(this.axisY, elements.minY, elements.maxY);
    setChildren(this.axisX, elements.titlesX);
    setChildren(this.plotArea, elements.bars);
  }
}

// класс История (таблица)
export class Hystory extends BaseComponent {
  constructor(page) {
    super(page);
    this.CLASSES = {
      wrapper: `hys ${this.page}-hys`,
      table: 'table',
      thead: 'table__thead',
      tbody: 'table__tbody',
      captions: 'table__captions',
      caption: 'table__caption',
      row: 'table__row',
      cell: 'table__cell',
      pagination: 'hys__pagination',
      sort: 'table__sort btn-reset',
    };
    this.types = [
      {
        name: 'from',
        label: 'Счёт отправителя',
        type: 'from',
        sortable: true,
      },
      {
        name: 'to',
        label: 'Счёт получателя',
        type: 'to',
        sortable: true,
      },
      {
        name: 'amount',
        label: 'Сумма',
        type: 'amount',
        sortable: true,
      },
      {
        name: 'date',
        label: 'Дата',
        type: 'date',
        sortable: true,
      },
    ];
  }

  // заполнить таблицу по-строчно
  fill(data) {
    let amount;

    const rows = data.map((transaction) => {
      const formatter_currency = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      });
      const formatter_date = new Intl.DateTimeFormat('ru', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });

      if (transaction.from == window.location.search.replace('?', '')) {
        amount = el(
          `td.table__cell negative`,
          '-' + formatter_currency.format(transaction.amount)
        );
      } else {
        amount = el(
          `td.table__cell positive`,
          '+' + formatter_currency.format(transaction.amount)
        );
      }

      const elem = el(
        `tr.table__row`,
        el(`td.table__cell`, transaction.from),
        el(`td.table__cell`, transaction.to),
        amount,
        el(`td.table__cell`, formatter_date.format(new Date(transaction.date)))
      );

      return elem;
    });
    return rows;
  }

  // получить данные для таблицы
  getData() {
    return [];
  }

  // создать пагинацию, вернуть готовый блок с обработчиками событий
  createPagination(pages, data) {
    const pagination = new PaginationForTable(this.page, pages).init({
      onClick: this.fill,
      getData: data,
    });
    pagination.classList.add(this.CLASSES.pagination);

    return pagination;
  }

  // создать строки в таблице
  createRows(data) {
    const rows = this.fill(data.slice(0, 10));
    return rows;
  }

  // инициировать таблицу, получить и вернуть готовый элемент
  init({ data }) {
    const wrapper = el(`div.${this.CLASSES.wrapper}`);
    const table = el(`table.${this.CLASSES.table}`);
    const thead = el(`thead.${this.CLASSES.thead}`);
    this.tbody = el(`tbody.${this.CLASSES.tbody}`);
    this.data = data;

    const captions = this.types.map((type) => {
      const caption = el(`th.${this.CLASSES.cell} ${this.CLASSES.caption}`);
      if (type.sortable) {
        const sortBtn = el(`button.${this.CLASSES.sort}`, {
          'data-sort': type.name,
        });
        sortBtn.innerHTML = createSvg('sortup', 'table__svg');
        setChildren(caption, el('span', type.label), sortBtn);

        sortBtn.addEventListener('click', (el) => {
          el.preventDefault();
          el.stopPropagation();
          const option = sortBtn.classList.contains('isUp') ? true : false;
          if (sortBtn.classList.contains('isUp')) {
            sortBtn.innerHTML = createSvg('sortup', 'table__svg');
          } else {
            sortBtn.innerHTML = createSvg('sortdown', 'table__svg');
          }

          const choosenPaginationBtn = document.querySelector('.is-choosen');
          const firstPaginationBtn = document.querySelector('.pagination__btn');
          if (choosenPaginationBtn) {
            choosenPaginationBtn.classList.remove('is-choosen');
          }

          if (firstPaginationBtn) {
            firstPaginationBtn.classList.add('is-choosen');
          }

          const sorted = sortFunc(data, type.name, option);

          const rows = this.fill(sorted.slice(0, 10));
          setChildren(this.tbody, rows);
          sortBtn.classList.toggle('isUp');
        });
      } else {
        setChildren(caption, el('span', type.label));
      }
      return caption;
    });

    const headRow = el(`tr.${this.CLASSES.captions}`, captions);
    const pages = Math.ceil(data.length / 10);

    const rows = this.fill(data.slice(0, 10));

    setChildren(thead, headRow);
    setChildren(this.tbody, rows);
    setChildren(table, thead, this.tbody);

    if (pages > 1) {
      const pagination = this.createPagination(pages, data);
      setChildren(wrapper, table, pagination);
    } else {
      setChildren(wrapper, table);
    }

    return wrapper;
  }
}

// класс Пагинация
export class Pagination extends BaseComponent {
  constructor(page, numbers) {
    super(page);
    this.CLASSES = {
      pagination: `pagination`,
      arrow: 'arrow pagination__svg',
      arrowBtn: 'pagination__arrow',
      pagis: 'pagination__btns',
      ellipsisBtn: 'pagination__ellipses',
      ellipsis: 'ellipsis pagination__svg',
      pagBtn: 'pagination__btn',
    };
    this.max = 10;
    this.nums = numbers;
    this.leftArrow = `<svg width="7" class="${this.CLASSES.arrow}" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 0.75L1 5L5.5 9.25" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    this.rightArrow = `<svg width="7" class="${this.CLASSES.arrow}" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 9.25L6 5L1.5 0.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    this.activePage = 0;
  }

  // событие при клике на кнопку
  onClick() {
    return;
  }

  // изменить статус кнопки при клике, пометить её как выбранную
  changeStatus(to) {
    const prev = document.querySelectorAll('.is-choosen');
    prev.forEach((el) => {
      el.classList.remove('is-choosen');
    });
    if (to) {
      to.classList.add('is-choosen');
    }
  }

  // крайние случаи
  ifExtreme() {
    if (this.btns[0].textContent == 1) {
      setAttr(this.prevBtn, { disabled: true });
      setAttr(this.toStart, { disabled: true });
    } else {
      this.prevBtn.removeAttribute('disabled');
      this.toStart.removeAttribute('disabled');
    }

    if (this.btns[this.btns.length - 1].textContent == this.nums) {
      setAttr(this.nextBtn, { disabled: true });
      setAttr(this.toEnd, { disabled: true });
      setAttr(this.ellipsis, { disabled: true });
    } else {
      this.nextBtn.removeAttribute('disabled');
      this.toEnd.removeAttribute('disabled');
      this.ellipsis.removeAttribute('disabled');
    }
  }

  // создать кнопки
  createBtns(handlers) {
    this.btns = [];

    for (let i = 0; i < Math.min(this.nums, 10); i++) {
      const btn = el(`button. ${this.CLASSES.pagBtn}`, i + 1);
      btn.addEventListener('click', () => {
        this.changeStatus(btn);
        this.activePage = btn.textContent;
        this.onClick(btn, handlers);
      });
      this.btns.push(btn);
    }
  }

  // обновить/перезаписать подписи кнопок
  reNewBtnsContent(from) {
    this.changeStatus();

    this.btns.reduce((acc, btn) => {
      btn.textContent = acc;
      if (parseInt(acc) == this.activePage) {
        this.changeStatus(btn);
      }
      return acc + 1;
    }, from);
    this.ifExtreme();
  }

  // инициировать пагинацию, вернуть готовый элемент
  init(handlers) {
    const pagination = el(`div.${this.CLASSES.pagination}`);

    this.prevBtn = el(`button.${this.CLASSES.pagBtn}`);
    this.nextBtn = el(`button.${this.CLASSES.pagBtn}`);
    this.toStart = el(`button.${this.CLASSES.pagBtn}`);
    this.toEnd = el(`button.${this.CLASSES.pagBtn}`);
    this.ellipsis = el(`button.${this.CLASSES.pagBtn}`, '...');

    this.createBtns(handlers);
    this.changeStatus(this.btns[0]);
    this.ifExtreme();

    this.toStart.innerHTML = '<<';
    this.prevBtn.innerHTML = this.leftArrow;
    this.nextBtn.innerHTML = this.rightArrow;
    this.toEnd.innerHTML = '>>';

    this.prevBtn.addEventListener('click', () => {
      const newFrom = Math.max(1, parseInt(this.btns[0].textContent) - 1);
      this.reNewBtnsContent(newFrom);
    });

    this.nextBtn.addEventListener('click', () => {
      const newFrom = Math.min(
        this.nums - this.max + 1,
        parseInt(this.btns[0].textContent) + 1
      );
      this.reNewBtnsContent(newFrom);
    });

    this.ellipsis.addEventListener('click', () => {
      const newFrom = Math.min(
        this.nums - this.max + 1,
        parseInt(this.btns[0].textContent) + 10
      );
      this.reNewBtnsContent(newFrom);
    });

    this.toStart.addEventListener('click', () => this.reNewBtnsContent(1));
    this.toEnd.addEventListener('click', () =>
      this.reNewBtnsContent(this.nums - this.max + 1)
    );

    if (this.nums > this.max) {
      setChildren(
        pagination,
        this.toStart,
        this.prevBtn,
        this.btns,
        this.ellipsis,
        this.nextBtn,
        this.toEnd
      );
    } else {
      setChildren(pagination, this.btns);
    }

    return pagination;
  }
}

// класс Пагинация для Таблицы, расширенная Пагинация
class PaginationForTable extends Pagination {
  // событие при клике на кнопки
  async onClick(el, handlers) {
    const pages = el.textContent * 10;
    const dataToTable = handlers.getData;

    const tbody = document.querySelector('tbody');

    const rows = handlers.onClick(dataToTable.slice(pages - 10, pages));
    setChildren(tbody, rows);
  }
}

// класс Валютная таблица
export class CurTable extends BaseComponent {
  constructor(page, name) {
    super(page);
    this.CLASSES = {
      curTable: `cur-table`,
      curRow: `cur-table__row`,
      curCode: `cur-table__code`,
      curAmount: `cur-table__value`,
    };
    this.formatter_number = new Intl.NumberFormat('ru', {});
    this.name = name;
  }

  // добавить строку
  addRow(data) {
    const formatter_number = new Intl.NumberFormat('ru', {});
    const row = el(`div.cur-table__row`);
    const code = el(`span.cur-table__code`, data.code);
    const rate = el(`span.cur-table__rate`);
    const amount = el(
      `span.cur-table__value`,
      formatter_number.format(data.amount)
    );
    const change = el('span.cur-table__change');

    if (data.change == 1) {
      change.innerHTML = createSvg('increase', 'rateSvg');
      setChildren(rate, amount, change);
    } else if (data.change == -1) {
      change.innerHTML = createSvg('decrease', 'rateSvg');
    }

    setChildren(rate, amount, change);
    setChildren(row, code, rate);
    return row;
  }

  // заполнить таблицу
  fill(data) {
    const formatter_number = new Intl.NumberFormat('ru', {});
    const rows = Object.keys(data).map((item) => {
      const row = el(`div.cur-table__row`);
      const code = el(`span.cur-table__code`, data[item].code);
      const amount = el(
        `span.cur-table__value`,
        formatter_number.format(data[item].amount)
      );

      setChildren(row, code, amount);
      return row;
    });
    return rows;
  }

  // инициировать таблицу, вернуть готовый элемент
  init(data = []) {
    this.table = el(`div.${this.CLASSES.curTable} ${this.name}`);

    const rows = this.fill(data);

    setChildren(this.table, rows);

    return this.table;
  }
}

// класс Перетаскивание
export class Drag extends BaseComponent {
  constructor(page) {
    super(page);
    this.CLASSES = {
      grid: `${this.page}-page__grid list-reset`,
    };
  }

  // событие когда элемент в процессе переноса
  _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const target = e.target;
    const targetPos = target.getBoundingClientRect();

    if (target && target !== this.dragEl && target.classList.contains('tile')) {
      const next =
        (e.clientY - targetPos.top) / targetPos.height > 0.5 ||
        (e.clientX - targetPos.left) / targetPos.width > 0.5;
      next
        ? this.section.insertBefore(this.dragEl, target)
        : this.section.insertBefore(this.dragEl, target.nextSibling);
    }
  }

  // событие по завершению перетаскивания
  _onDragEnd(e) {
    e.preventDefault();

    this.dragEl.classList.remove('ghost');
    this.section.removeEventListener('dragover', {
      handleEvent: this.onDragOver,
      section: this.section,
      dragEl: this.dragEl,
    });
    this.section.removeEventListener('dragend', {
      handleEvent: this.onDragEnd,
      section: this.section,
      dragEl: this.dragEl,
      onDragOver: this.onDragOver,
      onDragEnd: this.onDragEnd,
    });
  }

  // инициация событий для перетаскиваемых элементов
  sortable(section, { onDragEnd, onDragOver }) {
    let dragEl;

    [...section.children].forEach((item) => {
      item.draggable = true;
    });

    section.addEventListener('dragstart', function (e) {
      dragEl = e.target;

      e.dataTransfer.effectAllowed = 'move';

      section.addEventListener('dragover', {
        handleEvent: onDragOver,
        section: section,
        dragEl: dragEl,
      });
      section.addEventListener('dragend', {
        handleEvent: onDragEnd,
        section: section,
        dragEl: dragEl,
        onDragOver: this._onDragOver,
        onDragEnd: this._onDragEnd,
      });

      setTimeout(function () {
        dragEl.classList.add('ghost');
      }, 0);
    });
  }

  // инициализация свойства drag&drop для контейнера (элементов внутри него)
  init(section) {
    this.sortable(section, {
      onDragEnd: this._onDragEnd,
      onDragOver: this._onDragOver,
    });
  }
}
