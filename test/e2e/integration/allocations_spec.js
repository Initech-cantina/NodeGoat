/// <reference types="Cypress" />

describe("/allocations behaviour", () => {
    "use strict";

    before(() => {
        cy.dbReset();
    });

    afterEach(() => {
        cy.visitPage("/logout");
    });

    it("Should redirect if the user has not logged in", () => {
        cy.visitPage("/allocations/2");
        cy.url().should("include", "login");
    });

    it("Should be accesible for a logged user", () => {
        cy.userSignIn();
        cy.visitPage("/allocations/2");
        cy.url().should("include", "allocations");
    });

    it("Should be an input", () => {
        cy.userSignIn();
        cy.visitPage("/allocations/2");
        cy.get("input[name='threshold']");
    });

    it("Should redirect the user", () => {
        var threshold = 2;
        cy.userSignIn();
        cy.visitPage("/allocations/2");

        cy.get("input[name='threshold']")
            .clear()
            .type(threshold);

        cy.get("button[type='submit']")
            .click();

        cy.location().should((loc) => {
            expect(loc.search).to.eq("?threshold=" + threshold);
            expect(loc.pathname).to.eq("/allocations/2");
        });
    });

    it("Should not expose other users allocations via IDOR", () => {
        cy.userSignIn();
        // user1 has userId 2; attempt to access admin allocations (userId 1)
        cy.visitPage("/allocations/1");
        cy.url().should("include", "allocations");
        // The page should show the logged-in user (John Doe), not admin
        cy.get(".panel-info .panel-heading").should("contain", "John");
        cy.get(".panel-info .panel-heading").should("not.contain", "Admin");
    });
});
