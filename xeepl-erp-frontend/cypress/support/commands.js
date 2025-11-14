// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for login (adjust based on your auth setup)
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  // Add your login logic here
  // cy.get('[name="username"]').type(username);
  // cy.get('[name="password"]').type(password);
  // cy.get('button[type="submit"]').click();
});

// Custom command to wait for table to load
Cypress.Commands.add('waitForTable', () => {
  cy.get('.quotation-table, .quotation-lines-mobile', { timeout: 10000 }).should('exist');
});

