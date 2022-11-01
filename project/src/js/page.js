import { el, setChildren } from 'redom';
import { Header } from './header';

// класс Страница
export default class Page {
  constructor() {
    this.page = window.location.pathname.replace('/', '');
  }

  // инициировать создание DOM страницы
  renderPage() {
    const container = el('div.page-container');
    const header = new Header(this.page).createElement();
    const main = el(`main.main`);
    setChildren(container, header, main);
    return { container, main };
  }
}

// вернуть страницу
export function renderPage(src) {
  const page = new Page(src).renderPage();
  return page;
}
