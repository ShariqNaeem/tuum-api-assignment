import credentials from '../fixtures/credentials.json';
import personReqBody from '../fixtures/person.json';
import accountReqBody from '../fixtures/account.json';
import transactionReqBody from '../fixtures/transaction.json';
import utils from '../support/utils';

let headers = {
    "x-channel-code": "SYSTEM",
    "x-tenant-code": "MB"  
}
let personIdForAccount;
let accountIdForTransaction;

describe("TUUM API Tests", () => {
    // This before method only execute once and we are extracting the "x-auth-token"
    before(()=>{
        cy.api({
            method: "POST",
            url: `${Cypress.env('authUrl')}/v1/employees/authorise`,
            body: credentials,
            headers: headers,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(200);
            headers['x-auth-token'] = response.body.data.token;
        })
    })

    it("Calling A POST API That Creating A Person", () => {
        // We need to create person ID number unique everytime
        let personID = utils.getRandomPersonID();
        personReqBody.identificationNumber.idNumber = personID;

        // call person api
        cy.api({
            method: "POST",
            url: `${Cypress.env('personUrl')}/v2/persons`,
            body: personReqBody,
            headers: headers,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.personalInfo.identificationNumber).to.have.property("idNumber");
            expect(response.body.data.personalInfo.identificationNumber.idNumber).to.be.a("string");
            expect(response.body.data.personalInfo.identificationNumber.idNumber).to.deep.equal(personID);
            personIdForAccount = response.body.data.personId;
        });
    });

    it("Calling A POST API That Creating An Account", () => {
        // Need the additional header so taken the new variable and added the x-request-id header
        let heardersForAccount = headers;
        heardersForAccount['x-request-id'] = utils.getRandomRequestID();
        //accountReqBody.representatives[0].personId = personIdForAccount;

        cy.api({
            method: "POST",
            url: `${Cypress.env('accountUrl')}/v4/persons/${personIdForAccount}/accounts`,
            body: accountReqBody,
            headers: heardersForAccount,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(200);
            // Used all the assertions that you want to add for the response body
            // accountIdForTransaction = response.ACCOUNT_ID_KEY save account ID for getting the account balance
        });
    });

    it("Calling A GET API That Fetching Account Balance", () => {
        cy.api({
            method: "GET",
            url: `${Cypress.env('accountUrl')}/v1/accounts/${accountIdForTransaction}/balances`,
            headers: headers,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(200);
            // Used all the assertions that you want to add for the response body
        });
    });

    it("Calling A POST API That Making A Transaction", () => {
        // Need the additional header so taken the new variable and added the x-request-id header
        let heardersForAccount = headers;
        heardersForAccount['x-request-id'] = utils.getRandomRequestID();
        cy.api({
            method: "POST",
            url: `${Cypress.env('accountUrl')}/v4/accounts/${accountIdForTransaction}/transactions`,
            body: transactionReqBody,
            headers: headers,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(200);
            // Used all the assertions that you want to add for the response body
        });
    });
});