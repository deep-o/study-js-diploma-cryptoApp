import { el, setChildren } from 'redom';
import { PrimaryBtn } from './components';
import { createSvg } from '../funcs/funcs';

// класс Верх
export default class Top {
  constructor() {
    this.CLASSES = {
      topline: 'topline',
      title: `${this.page}__name ${this.page}-page__item text-reset`,
    };
    this.page = window.location.pathname.replace('/', '');
    this.top = el(`div.page__top ${this.page}-page__top`);
    this.topline = el(`div.topline ${this.page}-topline`);
    this.title;
    this.btn;
    this.formatter_currency = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    });
  }

  // создать кнопу с иконкой
  createBtn(btnText, svgName = NaN) {
    this.btn = new PrimaryBtn(`topline`, btnText).createElement();

    const mark = el('span.btn-icon__svg');
    const text = el('span', btnText);

    if (svgName) {
      const svg = createSvg(svgName, 'btn-icon__icon');
      mark.innerHTML = svg;
    }

    setChildren(this.btn, mark, text);
  }

  // создать заголовок
  createTitle(titleText) {
    this.title = el(
      `h2.page-title ${this.page}-page__title text-reset`,
      titleText
    );
  }

  // создать и вернуть готовый элемент с содержимым: заголовок, кнопка
  createTop() {
    this.createTitle('Заголовок');
    this.createBtn('Кнопка');
    setChildren(this.topline, this.title, this.btn);
    setChildren(this.top, this.topline);
    return this.top;
  }
}
