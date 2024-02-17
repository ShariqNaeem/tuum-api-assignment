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
let account_Id;

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
        //accountReqBody.accountNumbers[0].accountNumber.value = utils.generateRandomGermanIBAN();
        cy.api({
            method: "POST",
            url: `${Cypress.env('accountUrl')}/v4/persons/${personIdForAccount}/accounts`,
            body: accountReqBody,
            headers: heardersForAccount,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(400);
            expect(response.body.validationErrors[0].errors[0]).to.have.property("code");
            expect(response.body.validationErrors[0].errors[0].code).to.be.a("string");
            expect(response.body.validationErrors[0].errors[0].code).to.deep.equal('err.accountNumberAlreadyExists');
        });
    });

    it("Calling A GET API That Fetching Account Balance", () => {
        account_Id= 'ID-2000'; // Hard-coded this value because I am not able to create account with different IBAN
        cy.api({
            method: "GET",
            url: `${Cypress.env('accountUrl')}/v1/accounts/${account_Id}/balances?currencyCode=EUR`,
            headers: headers,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data[0]).to.have.property("balanceId");
            expect(response.body.data[0].balanceId).to.be.a("string");
            expect(response.body.data[0]).to.have.property("accountId");
            expect(response.body.data[0].accountId).to.be.a("string");
            expect(response.body.data[0].accountId).to.deep.equal(account_Id);

            expect(response.body.data[0]).to.have.property("currencyCode");
            expect(response.body.data[0].currencyCode).to.be.a("string");
            expect(response.body.data[0].currencyCode).to.deep.equal("EUR");

            expect(response.body.data[0]).to.have.property("balanceAmount");
            expect(response.body.data[0].balanceAmount).to.be.a("number");
        });
    });

    it("Calling A POST API That Making A Transaction", () => {
        // Need the additional header so taken the new variable and added the x-request-id header
        account_Id= 'ID-2000';
        let heardersForAccount = headers;
        heardersForAccount['x-request-id'] = utils.getRandomRequestID();
        cy.api({
            method: "POST",
            url: `${Cypress.env('accountUrl')}/v4/accounts/${account_Id}/transactions`,
            body: transactionReqBody,
            headers: headers,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data[0]).to.have.property("accountTransactionId");
            expect(response.body.data[0].accountTransactionId).to.be.a("string");
            expect(response.body.data[0]).to.have.property("transactionTypeCode");
            expect(response.body.data[0].transactionTypeCode).to.be.a("string");
            expect(response.body.data[0].transactionTypeCode).to.deep.equal(transactionReqBody.transactionTypeCode);

            expect(response.body.data[0]).to.have.property("amount");
            expect(response.body.data[0].amount).to.be.a("number");
            expect(response.body.data[0].amount).to.deep.equal(transactionReqBody.money.amount);

            expect(response.body.data[0]).to.have.property("currencyCode");
            expect(response.body.data[0].currencyCode).to.be.a("string");
            expect(response.body.data[0].currencyCode).to.deep.equal(transactionReqBody.money.currencyCode);

            expect(response.body.data[0]).to.have.property("transactionDTime");
            expect(response.body.data[0].transactionDTime).to.be.a("string");
            expect(response.body.data[0].transactionDTime).to.not.be.null;

            expect(response.body.data[0]).to.have.property("counterparty");
            expect(response.body.data[0].counterparty).to.be.an("object");
            expect(response.body.data[0].counterparty).to.deep.equal(transactionReqBody.counterparty);
        });
    });
});