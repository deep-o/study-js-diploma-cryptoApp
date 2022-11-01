import { doc } from 'prettier';
import { el, setChildren } from 'redom';
import '../scss/components/_entry.scss';
import { BigTile, Formy } from './components/components';
import Main from './components/main';
import { getUserTocken } from './components/api_methods';

// создать main для страницы Авторизация
export default function renderPage() {
  const main = new EntryMain('entry').init();
  return main;
}

// класс main для страницы Авторизация
class EntryMain extends Main {
  constructor(name) {
    super(name);
    this.CLASSES = {
      title: 'page-title entry-form__title text-reset',
    };
  }

  // создать плитку
  createTile() {
    this.entryTile = el(
      new BigTile('entry-page', 'grey').createElement(),
      el(`h2.${this.CLASSES.title}`, 'Вход в аккаунт'),
      this.form
    );
  }

  // инициализировать создание страницы, вернуть готовый элемент
  init() {
    this.form = new EntryForm('entry').init();
    this.createTile();

    setChildren(this.container, this.entryTile);
    return this.container;
  }
}

// класс Форма для Авторизации
class EntryForm extends Formy {
  constructor(page) {
    super(page);
    this.inputTypes = [
      {
        name: 'login',
        type: 'text',
        label: 'Логин',
        placeholder: 'example',
        dropdown: false,
        ls: 'coin-login',
        errMess: 'длина не менее 6 символов',
      },
      {
        name: 'password',
        type: 'password',
        label: 'Пароль',
        placeholder: '******',
        dropdown: false,
        errMess: 'длина не менее 6 символов',
      },
    ];
    this.btnSubmitText = 'Войти';
    this.formData = new FormData(this.form);
  }

  // вернуть сообщение об ошибке
  onError(type) {
    let elem_type;
    let text;

    switch (type) {
      case 'No such user':
        elem_type = 'login';
        text = 'Логин не найден';
        break;
      case 'Invalid password':
        elem_type = 'password';
        text = 'Пароль неверный';
        break;
      default:
        break;
    }
    return { type: elem_type, text };
  }

  // формирование и направление запроса серверу
  async onRequest() {
    const formData = new FormData(this.form);
    this.login = formData.get('login');
    const response = await getUserTocken(this.login, formData.get('password'));
    this.apiRes = response.data;
    return response;
  }

  // при получении ответа от сервера
  onResponse() {
    localStorage.setItem('token', JSON.stringify(this.apiRes.token));
    localStorage.setItem('coin-login', JSON.stringify(this.login));

    const url = window.location.origin;
    history.pushState({}, '', `${url}/accounts`);
    location.href = '';
  }

  // инициализировать создание формы и вернуть готовый элемент
  init() {
    this.createForm({
      inputTypes: this.inputTypes,
      btnText: this.btnSubmitText,
      //onSubmit: this.onSubmit,
    });

    this.inputs.forEach((el) => {
      const input = el.querySelector('input');
      input.addEventListener('blur', (e) => {
        this.onBlur({
          input: e.currentTarget,
        });
      });
    });

    return this.form;
  }
}
