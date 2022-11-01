import { el, setChildren } from 'redom';
import Top from './top';

// класс Main - создаёт контейнер main
export default class Main {
  constructor(page) {
    this.page = page;
    this.container = el(`div.container ${this.page}-page page-main`);
    this.top = NaN;
    this.btn = NaN;
    this.grid = el('div');
  }

  // создать верхнюю часть
  createTop() {
    const top = new Top();
    const topLine = top.createTop();
    this.btn = top.btn;
    return topLine;
  }

  // создать и вернуть готовый элемент: верхняя часть, сетка main
  createElement() {
    const top = new Top();
    this.top = top.createTop();
    this.btn = top.btn;

    setChildren(this.container, this.top, this.grid);
    return this.container;
  }
}
