/// <reference types="Cypress" />

describe("/contributions behaviour", () => {
  "use strict";

  before(() => {
    cy.dbReset();
  });

  afterEach(() => {
    cy.visitPage("/logout");
  });

  it("Should redirect if the user has not logged in", () => {
    cy.visitPage("/contributions");
    cy.url().should("include", "login");
  });

  it("Should be accesible for a logged user", () => {
    cy.userSignIn();
    cy.visitPage("/contributions");
    cy.url().should("include", "contributions");
  });

  it("Should be a table with several inputs", () => {
    cy.userSignIn();
    cy.visitPage("/contributions");
    cy.get("table")
      .find("input")
      .should("have.length", 3);
  });

  it("Should input be modified", () => {
    const value = "12";
    cy.userSignIn();
    cy.visitPage("/contributions");
    cy.get("table")
      .find("input")
      .first()
      .clear()
      .type(value);

    cy.get("button[type='submit']")
      .click();

    cy.get("tbody > tr > td")
      .eq(1)
      .contains(`${value} %`);

    cy.get(".alert-success")
      .should("be.visible");

    cy.url().should("include", "contributions");
  });
});

describe("/contributions security", () => {
  "use strict";

  before(() => {
    cy.dbReset();
  });

  afterEach(() => {
    cy.visitPage("/logout");
  });

  it("Should reject JavaScript expression payloads", () => {
    cy.userSignIn();
    cy.visitPage("/contributions");

    // Attempt to submit a JS expression instead of a number
    cy.get("table")
      .find("input")
      .first()
      .clear()
      .type("process.exit(1)");

    cy.get("button[type='submit']")
      .click();

    // Should show validation error, not execute the expression
    cy.get(".alert-danger")
      .should("be.visible");

    cy.url().should("include", "contributions");
  });

  it("Should reject non-numeric string payloads", () => {
    cy.userSignIn();
    cy.visitPage("/contributions");

    cy.get("table")
      .find("input")
      .first()
      .clear()
      .type("require('child_process').exec('id')");

    cy.get("button[type='submit']")
      .click();

    cy.get(".alert-danger")
      .should("be.visible");

    cy.url().should("include", "contributions");
  });
});
