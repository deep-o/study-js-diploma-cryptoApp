import { el, setChildren } from 'redom';
import { SmallTile, Dropdown, Drag } from './components/components';
import '../scss/components/_accounts.scss';
import Top from './components/top';
import Main from './components/main';
import {
  getAccountsData,
  getDataFromCache,
  createNewAccount,
} from './components/api_methods';
import { sortFunc } from './funcs/funcs';

// создать main для страницы Список счетов
export default async function renderPage() {
  const main = await new AccountMain('accounts').init();
  return main;
}

// Класс Верхняя часть: заголовок, кнопка назад, номер счёта, баланс
class AccountTop extends Top {
  constructor() {
    super();

    this.CLASSES = {
      dropdown: 'div.dropdown accounts-dropdown',
      dropdownBtn: 'button.dropdown__btn accounts-dropdown__btn',
    };
  }

  // создать полосу с заголовком и кнопкой Назад
  createTop() {
    this.createTitle('Ваши счета');
    this.createBtn('Создать новый счёт', 'plus');

    const dropdownWrap = el(`div.${this.CLASSES.dropdown}`);
    this.dropdownTrigger = el(
      `button.${this.CLASSES.dropdownBtn}`,
      'Сортировка'
    );

    this.dropdown = new AccDrop('accounts', dropdownWrap);
    this.dropdown.init(this.dropdownTrigger);
    this.dropBtns = this.dropdown.dropBtns;

    setChildren(this.topline, this.title, dropdownWrap, this.btn);
    setChildren(this.top, this.topline);
    return this.top;
  }
}

// Класс main для страницы Список счетов
class AccountMain extends Main {
  constructor(page) {
    super(page);
    this.CLASSES = {
      container: 'div.container accounts-page',
      grid: 'accounts-page__grid list-reset',
      wrapper: 'accounts-page__wrapper',
      is_checked: 'is-checked',
    };
  }

  // создать плитку для счёта
  createAccountTile(acc) {
    const account = acc.account;
    const balance = acc.balance;
    let last_date;

    const formatter_currency = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    });

    const formatter_date = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    try {
      const acc_date = acc.transactions[0].date;
      last_date = formatter_date.format(new Date(acc_date));
    } catch {
      last_date = formatter_date.format(new Date());
    }
    const tile = new SmallTile({
      page: 'account',
      account,
      summ: formatter_currency.format(balance),
      date: last_date,
    }).createElement();

    return tile;
  }

  // создать плитки для всех счетов
  renderAccTiles() {
    const account_tiles = [];

    this.data.forEach((acc) => {
      const elem = this.createAccountTile(acc);
      account_tiles.push(elem);
    });
    const gridLine = el(`ul.${this.CLASSES.grid}`);
    setChildren(gridLine, account_tiles);

    setChildren(this.grid, gridLine);

    new Drag('accounts').init(gridLine);
  }

  // событие по клику кнопки Открыть (для счёта)
  setOnChooseEvent(el) {
    el.forEach((btn) => {
      btn.addEventListener('click', () => {
        let option = btn.classList.contains('isUp') ? true : false;

        const sortKey = btn.firstChild.dataset.drop;
        if (sortKey == 'transactions') {
          option = true;
        }

        this.data = sortFunc(this.data, [sortKey], option);
        btn.classList.toggle('isUp');
        this.renderAccTiles();
      });
    });
  }

  // создать DOM элементы
  createElements() {
    const top = new AccountTop();

    this.top = top.createTop();
    this.btn = top.btn;
    this.dropdown = top.dropdown;
    this.dropBtns = top.dropBtns;

    if (this.acc_count > 9) {
      this.grid.classList.add(`${this.CLASSES.wrapper}`);
    }

    setChildren(this.container, this.top, this.grid);
  }

  // обновить плитки (нарисовать заново)
  async renewTiles() {
    this.data = (await getAccountsData()).data;
    this.acc_count = this.data.length;
    this.renderAccTiles();
  }

  // инициализация сосздания элемента, вернуть готовый элемент
  async init() {
    const cacheData = (await getDataFromCache()).data;

    if (cacheData) {
      this.data = await cacheData;
      console.log('caching accounts data');
    } else {
      this.data = (await getAccountsData()).data;
    }

    this.acc_count = this.data.length;
    this.createElements();
    this.renderAccTiles();

    this.btn.addEventListener('click', async () => {
      const newAcc = await createNewAccount();
      this.data.push(newAcc.data);

      this.renderAccTiles();
    });

    this.dropBtns.forEach((btn) => {
      btn.addEventListener('click', (el) => {
        this.onChoose(el.currentTarget);
      });
    });

    this.dropdown.btn.addEventListener('click', () => {
      this.setOnChooseEvent(this.dropdown.dropBtns);
    });

    setChildren(this.container, this.top, this.grid);

    console.log('...getting data from API');

    setTimeout(() => {
      getAccountsData()
        .then(() => {
          this.renderAccTiles();
        })
        .then(() => console.log('API data is loaded, tiles are renewed'));
    }, 0);

    return this.container;
  }
}

// класс Выпадающее меню для страницы Ваши счета
class AccDrop extends Dropdown {
  // получить список в меню
  getDropItems() {
    return [
      { name: 'account', text: 'По номеру', default: '' },
      {
        name: 'balance',
        text: 'По балансу',
        default: 'is-checked',
      },
      { name: 'transactions', text: 'По последней транзакции', default: '' },
    ];
  }
}
