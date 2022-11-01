import { el, setChildren } from 'redom';
import '../scss/components/_atm.scss';
import Top from './components/top';
import Main from './components/main';
import { getBanks } from './components/api_methods';
import ymaps from 'ymaps';

// создать main для страницы Банкоматы
export default async function renderPage() {
  const main = await new AtmMain('atm').init();
  return main;
}

// Класс Верхняя часть: заголовок
class AtmTop extends Top {
  constructor() {
    super();

    this.createTitle('Карта банкоматов');
  }

  // создать полосу с заголовком
  createTopLine() {
    const topLine = el(`div.${this.CLASSES.topline}`);

    setChildren(topLine, this.title);
    return topLine;
  }

  // создать верхнюю часть, стостояющую из одной полосы: Заголовок
  createTop() {
    const top = this.createTopLine();

    setChildren(this.top, top);
    return this.top;
  }
}

// Класс main для страницы Банкоматы
class AtmMain extends Main {
  constructor(page) {
    super(page);
    this.CLASSES = {};
  }

  // создать карту и добавить карту
  async createMap(container, marks) {
    const mymap = await ymaps
      .load('https://api-maps.yandex.ru/2.1/?lang=ru_RU')
      .then((maps) => {
        maps.modules.require(['Placemark']);
        const map = new maps.Map(container, {
          center: [55.750978, 37.623184],
          zoom: 11,
          placemark: [55.750978, 37.623184],
        });

        return { maps, map };
      });

    marks.forEach((mark) => {
      const placemark = new mymap.maps.Placemark(
        [mark.lat, mark.lon],
        {
          balloonContentHeader: `Coin.`,
          balloonContentBody: `[${mark.lat}, ${mark.lon}]`,
          hintContent: 'show coordinates',
        },
        {}
      );
      mymap.map.geoObjects.add(placemark);
    });
  }

  // создать DOM, получить список банкоматов от сервера
  async createElements() {
    const top = new AtmTop();
    this.top = top.createTop();

    const marks = await getBanks();

    const mapContainer = el('div.map');
    await this.createMap(mapContainer, marks.data);

    setChildren(this.container, this.top, mapContainer);
  }

  // инициализировать создание страницы, получить готовый элемент
  async init() {
    await this.createElements();
    return this.container;
  }
}
