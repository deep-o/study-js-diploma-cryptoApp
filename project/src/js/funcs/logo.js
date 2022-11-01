import american from '/src/assets/banklogos/american.svg';
import visa from '/src/assets/banklogos/visa.svg';
import diners from '/src/assets/banklogos/diners-club.svg';
import discover from '/src/assets/banklogos/discover.svg';
import jcb from '/src/assets/banklogos/jcb.svg';
import maestro from '/src/assets/banklogos/maestro.svg';
import master from '/src/assets/banklogos/master-card.svg';
import mir from '/src/assets/banklogos/mir.svg';
import unionpay from '/src/assets/banklogos/unionpay.svg';
import def from '/src/assets/banklogos/default.svg';

import { el, setAttr } from 'redom';

// вернуть название файла с логотипом в папке assets/banklogos
function defineLogo(value) {
  let logo;

  switch (value) {
    case 'american-express':
      logo = american;
      break;
    case 'visa':
      logo = visa;
      break;
    case 'diners-club':
      logo = diners;
      break;
    case 'discover':
      logo = discover;
      break;
    case 'jcb':
      logo = jcb;
      break;
    case 'maestro':
      logo = maestro;
      break;
    case 'master-card':
      logo = master;
      break;
    case 'mir':
      logo = mir;
      break;
    case 'unionpay':
      logo = unionpay;
      break;
    default:
      logo = def;
      break;
  }

  return logo;
}

// создать и вернуть изображение логотипа
export function getImg(brand) {
  if (brand) {
    const img = el('img.bank-brand');
    const url = defineLogo(brand);
    setAttr(img, {
      src: url,
      alt: 'image',
    });

    return img;
  }

  return false;
}
