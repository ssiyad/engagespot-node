export class AuthFail extends Error {
    constructor() {
        super();
        this.message =
            "Authentication failed. Make sure you're using the right API Credentials. Please read our docs at https://documentation.engagespot.co";
        this.name = 'AuthFail';
    }
}
