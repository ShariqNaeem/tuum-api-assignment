class Utility {
    getRandomPersonID() {
        return `ID-${Math.floor(Math.random() * (99999999 - 10000000)) + 10000000}`;
    }

    getRandomRequestID() {
        return `f2961f6e-ab6c-4e3e-aec7-5351${Math.floor(Math.random() * (99999999 - 10000000)) + 10000000}`;
    }

    getRandomAccountNumber() {
        return `DE89370400440532013${Math.floor(Math.random() * (999 - 100)) + 10000000}`;
    }
}
export default new Utility()