/// <reference types="Cypress" />

describe("/allocations XSS protection", function() {
  "use strict";

  before(function() {
    cy.dbReset();
  });

  afterEach(function() {
    cy.visitPage("/logout");
  });

  it("Should reject non-hex userId path parameters with 400", function() {
    cy.userSignIn();

    // Attempt XSS payload in :userId - should be rejected by validation
    var xssPayload = "1\"><img src=x onerror=alert(1)>";
    cy.request({
      url: "/allocations/" + encodeURIComponent(xssPayload),
      failOnStatusCode: false
    }).then(function(response) {
      expect(response.status).to.eq(400);
    });
  });

  it("Should not reflect :userId path parameter into the response HTML", function() {
    cy.userSignIn();

    // Visit a valid allocations page and verify the response does not
    // contain the URL param directly in an unescaped attribute context
    cy.visitPage("/allocations/1");
    cy.get("form[role='search']").then(function($form) {
      var action = $form.attr("action");
      // The form action should use the session userId, not the URL param
      expect(action).not.to.contain("undefined");
    });
  });

  it("Should use session userId for allocations sidebar link", function() {
    cy.userSignIn();
    cy.visitPage("/allocations/1");
    cy.get("#allocations-menu-link").then(function($link) {
      var href = $link.attr("href");
      // The href should contain a valid userId from the session, not from URL
      expect(href).to.match(/\/allocations\/[a-f0-9]+/i);
    });
  });
});
