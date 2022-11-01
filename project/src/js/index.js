/* stylelint-disable */
import 'babel-polyfill';
import { el, setChildren } from 'redom';
import Navigo from 'navigo';
import '../scss/main.scss';
import Page from './page';
import { Skeleton } from './components/components';

// создать спрайт
function requireAll(r) {
  r.keys().forEach(r);
}

// eslint-disable-next-line no-undef
requireAll(require.context('../assets/icons/', true, /\.svg$/));

const router = new Navigo('/');
const page = new Page().renderPage();
setChildren(window.document.body, page.container);

// импортировать элемент
function importElement(path) {
  const element = import(`./${path}`).then((res) => {
    const elem = res.default();
    return elem;
  });

  return element;
}

// установить таймер
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// функция ожидания (для тестирования скелетона, кэширования и т.п.)
async function sleep() {
  await timeout(300);
}

// создать страницу
async function renderPage(src) {
  const title = el(
    'h1.visually-hidden',
    'Приложение Coin для операций над криптосчетами'
  );

  const skeleton = new Skeleton('skeleton').init();
  setChildren(page.main, skeleton);
  await sleep();
  const content = await importElement(src);
  setChildren(page.main, title, content);
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = JSON.parse(localStorage.getItem('token'));

  if (!token) {
    router.navigate('/entry');
  }
});

// список роутеров

router.on('/', () => {
  renderPage('entry');
});

router.on('/entry', () => {
  renderPage('entry');
});

router.on('/accounts', () => {
  renderPage('accounts');
});

router.on('/acc', () => {
  renderPage('acc');
});

router.on('/hystory', () => {
  renderPage('hystory');
});

router.on('/currencies', () => {
  renderPage('currencies');
});

router.on('/atm', () => {
  renderPage('atm');
});

router.resolve();
