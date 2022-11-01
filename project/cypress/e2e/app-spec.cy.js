/* eslint-disable jest/expect-expect */
/* eslint-disable no-undef */
//import cy = require("cypress");

/* eslint-disable jest/valid-expect */
describe('Приложение Coin', () => {
  beforeEach(() => {
    localStorage.setItem('token', JSON.stringify('ZGV2ZWxvcGVyOnNraWxsYm94'));
  });
  it('Происходит авторизация', () => {
    cy.visit('http://localhost:8080');
    cy.get('form').within(($form) => {
      cy.get('input[name="login"]').type('developer', { force: true });
      cy.get('input[name="password"]').type('skillbox', { force: true });
      cy.root().submit();
    });
  });

  it('Открывается страница со списком счетов', () => {
    cy.url().should('include', '/accounts');
    cy.get('.accounts-page');
  });

  it('На страницу загружается список счетов', () => {
    cy.get('ul').children('li');
  });

  it('Открывается страница с детализацией по счёту', () => {
    cy.contains('Открыть').click({ force: true });
  });

  it('Осуществляется перевод со счёта на счёт', () => {
    cy.get('form').within(($form) => {
      cy.get('input[name="number"]').type('61253747452820828268825011');
      cy.get('input[name="summ"]').type('100');
      cy.root().submit();
    });
  });

  it('Происходит возврат назад на страницу со списком счетов', () => {
    cy.contains('Вернуться назад').click({ force: true });
  });

  it('Создаётся новый счёт', () => {
    cy.wait(300);
    cy.contains('Создать новый счёт').click();
  });
});
