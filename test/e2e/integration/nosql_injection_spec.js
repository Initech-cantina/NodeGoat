/// <reference types="Cypress" />

describe("/login NoSQL operator injection prevention", () => {
  "use strict";

  before(() => {
    cy.dbReset();
  });

  afterEach(() => {
    cy.visitPage("/logout");
  });

  it("should reject $ne operator in userName via JSON body", () => {
    cy.request({
      method: "POST",
      url: "/login",
      body: {
        userName: { $ne: null },
        password: "anything"
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain("Invalid username and/or password");
      // Must NOT contain any indication of a matched user (password error)
      expect(response.body).to.not.contain("Invalid password");
    });
  });

  it("should reject $regex operator in userName via JSON body", () => {
    cy.request({
      method: "POST",
      url: "/login",
      body: {
        userName: { $regex: ".*" },
        password: "anything"
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain("Invalid username and/or password");
    });
  });

  it("should reject $gt operator in userName via JSON body", () => {
    cy.request({
      method: "POST",
      url: "/login",
      body: {
        userName: { $gt: "" },
        password: "anything"
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain("Invalid username and/or password");
    });
  });

  it("should reject non-string password via JSON body", () => {
    cy.request({
      method: "POST",
      url: "/login",
      body: {
        userName: "admin",
        password: { $ne: null }
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain("Invalid username and/or password");
    });
  });

  it("should still accept valid string credentials via JSON body", () => {
    cy.fixture("users/user.json").then((user) => {
      cy.request({
        method: "POST",
        url: "/login",
        body: {
          userName: user.user,
          password: user.pass
        },
        failOnStatusCode: false,
        followRedirect: false
      }).then((response) => {
        // Valid credentials should redirect (302) to dashboard, not show an error
        expect(response.status).to.be.oneOf([200, 302]);
        if (response.status === 200) {
          expect(response.body).to.not.contain("Invalid username and/or password");
        }
      });
    });
  });
});
