import { createHmac } from 'crypto';
import axios, { AxiosError, AxiosRequestHeaders, Method } from "axios";

class InsufficientRecipients extends Error {
    constructor() {
        super();
        this.message = 'Insufficient number of recipients configured'
        this.name = 'InsufficientRecipientsError';
    }
}

class AuthFail extends Error {
    constructor() {
        super();
        this.message = "Authentication failed. Make sure you're using the right API Credentials. Please read our docs at https://documentation.engagespot.co";
        this.name = 'AuthFail';
    }
}

/**
 * https://documentation.engagespot.co/docs/rest-api/#tag/Notifications/paths/~1v3~1notifications/post
 */
interface NotificationSchema {
    notification: {
        title: string;
        message?: string;
        url?: string;
        icon?: string;
    };
    recipients: string[];
    category?: string;
    override?: {
        channels?: string[];
    }
}

/**
 * basic unit, use setters to streamline data preparation
 */
class Notification {
    /**
     * 
     * @param client Engagespot client
     * @param title notification title
     */
    constructor(private client: Engagespot, title: string) {
        this.body = {
            notification: {
                title,
            },
            recipients: [],
        };
    }

    private body: NotificationSchema;

    /**
     * set a message
     * @param message string
     * @returns notification object itself
     */
    setMessage(message: string) {
        this.body.notification.message = message;
        return this;
    }

    /**
     * set a callback url
     * @param url string
     * @returns notification object itself
     */
    setUrl(url: string) {
        this.body.notification.url = url;
        return this;
    }

    /**
     * set an icon for notification
     * @param iconUrl string
     * @returns notification object itself
     */
    setIcon(iconUrl: string) {
        this.body.notification.icon = iconUrl;
        return this;
    }

    /**
     * set a category
     * @param category string
     * @returns notification object itself
     */
    setCategory(category: string) {
        this.body.category = category;
        return this;
    }

    /**
     * add a recipient to targets
     * @param recipient string. eg: 'user@example.com'
     * @returns notification object itself
     */
    addRecipient(recipient: string) {
        this.body.recipients = Array.from(new Set(this.body.recipients).add(recipient));
        return this;
    }

    private haveEnoughRecipients() {
        return this.body.recipients.length > 0
    }

    /**
     * sends the prepared notification
     * @returns API response
     */
    send() {
        if (!this.haveEnoughRecipients()) {
            throw new InsufficientRecipients();
        }

        return this.client.sendNotification(this.body)
    }
}

/**
 * entry point
 */
export class Engagespot {
    private ENDPOINT: string = 'https://api.engagespot.co/v3/';
    private HEADERS: AxiosRequestHeaders;

    /**
     * 
     * @param apiKey API_KEY from Engagespot
     * @param apiSecret API_SECRET from Engagespot
     */
    constructor(private apiKey: string, private apiSecret: string) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;

        // https://documentation.engagespot.co/docs/rest-api/#section/Authentication
        this.HEADERS = {
            'X-ENGAGESPOT-API-KEY': this.apiKey,
            'X-ENGAGESPOT-API-SECRET': this.apiSecret,
        };
    }

    /**
     * 
     * @param url part of url/service. eg: 'notifications' for https://api.engagespot.co/v3/notifications
     * @param data data required to call the API
     * @param headers usually contains auth information along with supplementary data
     * @param method http method like 'GET' and 'POST'
     * @returns API response
     */
    private call(url: string, data: any, headers: AxiosRequestHeaders = this.HEADERS, method: Method = 'POST') {
        return axios({
            url: this.ENDPOINT + url,
            data,
            method,
            headers,
        })
            .catch((err: AxiosError) => {
                switch (err.response?.status) {
                    case 401:
                        throw new AuthFail();
                    default:
                        throw err;
                }
            });
    }

    // https://documentation.engagespot.co/docs/rest-api/#tag/Notifications/paths/~1v3~1notifications/post
    createNotification(t: string) {
        return new Notification(this, t);
    }

    /**
     * send an already prepared notification
     * @param notification body
     * @returns API response
     */
    sendNotification(notification: NotificationSchema) {
        return this.call('notifications', notification);
    }

    /** */
    /**
     * returns a sha256 encoded string used to further ensure security. read more at
     * https://documentation.engagespot.co/docs/HMAC-authentication/enabling-HMAC-authentication
     * @param userId
     * @returns encoded string
     */
    genHmac(userId: string) {
        return createHmac('sha256', this.apiSecret)
            .update(userId, 'utf8')
            .digest('base64');
    }
}
