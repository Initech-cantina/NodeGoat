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

  it("Should block absolute URL redirects to untrusted domains", () => {
    cy.userSignIn();
    cy.visitPage("/learn?url=https://evil.example.com");
    cy.url().should("include", "dashboard");
    cy.url().should("not.include", "evil");
  });

  it("Should block protocol-relative URL redirects", () => {
    cy.userSignIn();
    cy.visitPage("/learn?url=//evil.example.com");
    cy.url().should("include", "dashboard");
    cy.url().should("not.include", "evil");
  });

  it("Should block javascript: scheme redirects", () => {
    cy.userSignIn();
    cy.visitPage("/learn?url=javascript:alert(1)");
    cy.url().should("include", "dashboard");
  });

  it("Should allow redirects to trusted domains", () => {
    cy.userSignIn();
    // Khan Academy is used in the layout's learning resources link
    cy.request({
      url: "/learn?url=https://www.khanacademy.org/test",
      followRedirect: false
    }).then((response) => {
      expect(response.status).to.eq(302);
      expect(response.headers.location).to.include("khanacademy.org");
    });
  });

  it("Should fallback to /dashboard when no url is provided", () => {
    cy.userSignIn();
    cy.visitPage("/learn");
    cy.url().should("include", "dashboard");
  });
});
