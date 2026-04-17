/// <reference types="Cypress" />

describe("Login CSRF protection", () => {
    "use strict";

    before(() => {
        cy.dbReset();
    });

    beforeEach(() => {
        cy.visitPage("/login");
    });

    afterEach(() => {
        cy.visitPage("/logout");
    });

    it("should include a non-empty CSRF token in the login form", () => {
        cy.get("form#loginform input[name='_csrf']")
            .should("exist")
            .and("have.attr", "type", "hidden")
            .invoke("val")
            .should("not.be.empty");
    });

    it("should reject login POST without a valid CSRF token", () => {
        cy.request({
            method: "POST",
            url: "/login",
            body: {
                userName: "user1",
                password: "User1_123",
                _csrf: "invalid-token"
            },
            form: true,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(403);
        });
    });

    it("should allow login with valid CSRF token from form", () => {
        cy.fixture("users/user.json").as("user");
        cy.get("@user").then(user => {
            cy.get("#userName").type(user.user);
            cy.get("#password").type(user.pass);
            cy.get("[type='submit']").click();
            cy.url().should("include", "dashboard");
        });
    });
});
