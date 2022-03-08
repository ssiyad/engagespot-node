import { Engagespot } from './engagespot';
import { InsufficientRecipients } from './errors/insufficient-recipients.error';
import { NotificationSchema } from './types/notification-schema.interface';

/**
 * basic unit, use setters to streamline data preparation
 */
export class Notification {
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
        this.body.recipients = Array.from(
            new Set(this.body.recipients).add(recipient),
        );
        return this;
    }

    private haveEnoughRecipients() {
        return this.body.recipients.length > 0;
    }

    /**
     * sends the prepared notification
     * @returns API response
     */
    send() {
        if (!this.haveEnoughRecipients()) {
            throw new InsufficientRecipients();
        }

        return this.client.sendNotification(this.body);
    }
}
