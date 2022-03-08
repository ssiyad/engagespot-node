/**
 * https://documentation.engagespot.co/docs/rest-api/#tag/Notifications/paths/~1v3~1notifications/post
 */
export interface NotificationSchema {
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
    };
}
