/// <reference types="Cypress" />

describe("/signup CSRF protection", () => {
  "use strict";

  before(() => {
    cy.dbReset();
  });

  it("Should reject POST /signup without a valid CSRF token", () => {
    // Directly POST to /signup without a CSRF token — simulates cross-site form submission
    cy.request({
      method: "POST",
      url: "/signup",
      form: true,
      body: {
        userName: "csrf_attacker",
        firstName: "Attacker",
        lastName: "Test",
        password: "Attack_123",
        verify: "Attack_123",
        email: "attacker@example.com"
      },
      failOnStatusCode: false
    }).then((response) => {
      // csurf middleware should reject the request with 403
      expect(response.status).to.eq(403);
    });
  });

  it("Should include a non-empty CSRF token in the signup form", () => {
    // Visit the signup page to obtain a valid CSRF token
    cy.visitPage("/signup");
    cy.get("input[name='_csrf']")
      .should("exist")
      .invoke("val")
      .should("not.be.empty");
  });
});
