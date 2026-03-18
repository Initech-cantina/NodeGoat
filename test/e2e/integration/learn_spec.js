/// <reference types="Cypress" />

describe("/learn behaviour", () => {
  "use strict";

  afterEach(() => {
    cy.visitPage("/logout");
  });

  it("Should redirect if the user has not logged in", () => {
    cy.visitPage("/learn?url=/dashboard");
    cy.url().should("include", "login");
  });

  it("Should be accesible for a logged user", () => {
    cy.userSignIn();
    cy.visitPage("/learn?url=/dashboard");
    cy.url().should("include", "dashboard");
  });

  it("Should reject absolute external URLs and redirect to /", () => {
    cy.userSignIn();
    cy.visitPage("/learn?url=https://evil.example.com");
    cy.url().should("not.include", "evil.example.com");
  });

  it("Should reject protocol-relative URLs and redirect to /", () => {
    cy.userSignIn();
    cy.visitPage("/learn?url=//evil.example.com");
    cy.url().should("not.include", "evil.example.com");
  });

  it("Should handle missing url parameter safely", () => {
    cy.userSignIn();
    cy.visitPage("/learn");
    cy.url().should("not.include", "learn");
  });
});
