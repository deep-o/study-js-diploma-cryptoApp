import { el, setChildren } from 'redom';
import logo from '../assets/images/Logo.svg';
import '../scss/components/_header.scss';

// класс Header
export class Header {
  constructor() {
    this.page = window.location.pathname;
    this.linkTypes = [
      { name: 'atm', href: '/atm', text: 'Банкоматы' },
      { name: 'accounts', href: '/accounts', text: 'Счета' },
      { name: 'currencies', href: '/currencies', text: 'Валюты' },
      { name: 'entry', href: '/entry', text: 'Выйти' },
    ];
  }

  // создать ссылки с обработчиками событий
  createLinks(tag) {
    const links = this.linkTypes.map((link) => {
      const element = el(tag, { href: link.href }, link.text);

      if (element.pathname == this.page) {
        element.classList.add('disabled');
      }

      element.addEventListener('click', (el) => {
        el.preventDefault();
        history.pushState({}, '', element.href);
        location.href = '';
      });

      return element;
    });

    return links;
  }

  // создать Бургер-меню для мобильной версии
  createBurger() {
    this.burger = el('div.burger');
    const burgerBtn = el('button.btn btn-reset burger__btn');
    const svg =
      '<svg viewBox="0 0 64 48"><path d="M19,15 L45,15 C70,15 58,-2 49.0177126,7 L19,37"></path><path d="M19,24 L45,24 C61.2371586,24 57,49 41,33 L32,24"></path><path d="M45,33 L19,33 C-8,33 6,-2 22,14 L45,37"></path></svg>';

    const menu = el('nav.burger__nav');
    const links = this.createLinks('a.burger__link');
    setChildren(menu, links);

    burgerBtn.innerHTML = svg;

    burgerBtn.addEventListener('click', () => {
      this.burger.classList.toggle('open');
      burgerBtn.classList.toggle('active');
      if (burgerBtn.classList.contains('active')) {
        menu.classList.add('show');
      } else {
        menu.classList.remove('show');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.code == 'Escape') {
        this.burger.classList.remove('open');
        menu.classList.remove('show');
      }
    });

    setChildren(this.burger, burgerBtn, menu);
  }

  // создать DOM
  createElement() {
    const header = el('header.header');
    const container = el('div.container header__container');
    const logo_elem = el('img.page-header__logo', { src: logo });
    const links = this.createLinks('a.header-nav__link');
    this.createBurger();

    if (this.page == '/entry' || this.page == '/') {
      setChildren(container, logo_elem);
    } else {
      const headerNav = el('nav.header-nav', links);
      setChildren(container, logo_elem, headerNav, this.burger);
    }

    setChildren(header, container);
    return header;
  }
}
