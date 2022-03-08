export class InsufficientRecipients extends Error {
    constructor() {
        super();
        this.message = 'Insufficient number of recipients configured';
        this.name = 'InsufficientRecipientsError';
    }
}
