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

  it("Should block redirect to untrusted external domains", () => {
    cy.userSignIn();
    cy.visitPage("/learn?url=https://evil.com/phish");
    // Should fall back to home page, not redirect to evil.com
    cy.url().should("not.include", "evil.com");
  });

  it("Should block protocol-relative URL redirects", () => {
    cy.userSignIn();
    cy.visitPage("/learn?url=//evil.com");
    cy.url().should("not.include", "evil.com");
  });

  it("Should fall back to home when no URL is provided", () => {
    cy.userSignIn();
    cy.visitPage("/learn");
    cy.url().should("not.include", "learn");
  });
});
