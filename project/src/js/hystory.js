import { el, setChildren } from 'redom';
import '../scss/components/_hystory.scss';
import {
  BigTile,
  ChartBalance,
  ChartRatio,
  Hystory,
  Drag,
} from './components/components';
import Main from './components/main';
import { getAccountData } from './components/api_methods';
import { getTransactionsForBars, renderDataForTable } from './funcs/funcs';
import { AccTop } from './acc';

export default async function renderPage() {
  const main = await new HysMain('hystory').init();
  return main;
}

// Класс Верхняя часть: заголовок, кнопка назад, номер счёта, баланс
class HysTop extends AccTop {
  constructor() {
    super();
    this.createTitle('История баланса');
  }
}

// создать main для страницы История баланса
class HysMain extends Main {
  constructor(page) {
    super(page);
    this.CLASSES = {
      grid: `${this.page}-page__grid`,
    };
    this.tileTypes = [
      {
        name: 'dynamics',
        color: 'white',
        func: this.createDynamicTile,
        title: 'Динамика баланса',
      },
      {
        name: 'ratio',
        color: 'white',
        func: this.createRatioTile,
        title: 'Соотношение входящих исходящих транзакций',
      },
      {
        name: 'table',
        color: 'grey',
        func: this.createTableTile,
        title: 'История переводов',
      },
    ];
  }

  // получить данные по счёту от сервера
  async getData() {
    const id = window.location.search.replace('?', '');
    const response = await getAccountData(id);
    return response;
  }

  // создать плитку Динамика баланса (диаграмма)
  createDynamicTile(data) {
    const transactions = getTransactionsForBars({ data, num: 12 });

    const chart = new ChartBalance('hystory');
    const element = chart.init(transactions);

    return { element };
  }

  // создать плитку Соотношение входящих/исходящих транзакций (диаграмма)
  createRatioTile(data) {
    const transactions = getTransactionsForBars({ data, num: 12, split: true });

    const chart = new ChartRatio('hystory');
    const element = chart.init(transactions);

    return { element };
  }

  // создать плитку История переводов (таблица)
  createTableTile(data) {
    const table = new Hys('hystory');
    const dataToTable = renderDataForTable(data.transactions);
    const element = table.init({ data: dataToTable });

    return { element, className: 'table', class: table };
  }

  // создать плитки по списку this.tileTypse
  async renderAccTiles() {
    const id = window.location.search.replace('?', '');
    const response = await getAccountData(id);
    const data = response.data;

    const tiles = this.tileTypes.map((tile) => {
      const func = tile.func;
      const funcResult = func(data);
      const inner = funcResult.element;

      const outer = new HysTile(
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

  // создать DOM
  async createElements() {
    const response = await this.getData();

    const top = new HysTop();
    this.top = top.createTop(response.data.balance);
    this.btn = top.btn;

    this.grid.classList.add(`${this.CLASSES.grid}`);
    const tiles = await this.renderAccTiles();

    setChildren(this.grid, tiles);
    setChildren(this.container, this.top, this.grid);

    new Drag('hystory').init(this.grid);
  }

  // инициализировать создание и вернуть готовый элемент
  async init() {
    await this.createElements();
    return this.container;
  }
}

// класс Плитка для страницы Историябаланса
class HysTile extends BigTile {
  constructor(page, color, title) {
    super(page, color);
    this.title = el(`${this.CLASSES.title}`, title);
    this.wrapper = el(`div.${this.CLASSES.wrapper}`);
    this.elem = setChildren(this.classElem, this.title, this.wrap);
  }

  createElement() {
    setChildren(this.classElem, this.title, this.wrapper);
    return this.classElem;
  }
}

class Hys extends Hystory {
  async getData() {
    // console.log(this.data);
    // return this.data;
    // const id = window.location.search.replace('?', '');
    // const response = await getAccountData(id);
    // return response.data.transactions;
  }
}
