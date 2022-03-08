import axios, { AxiosRequestHeaders, Method, AxiosError } from 'axios';
import { createHmac } from 'crypto';
import { AuthFail } from './errors/auth-fail.error';
import { NotificationSchema } from './types/notification-schema.interface';
import { Notification } from './notification';
import { EngagespotConfig } from './types/config.interface';
import { DEVICE_TYPE, ENDPOINT } from './const';

/**
 * entry point
 */
export class Engagespot {
    private ENDPOINT: string = ENDPOINT;
    private HEADERS: AxiosRequestHeaders;

    /**
     * @param apiKey API_KEY from Engagespot
     * @param apiSecret API_SECRET from Engagespot
     */
    constructor(
        private apiKey: string,
        private apiSecret: string,
        private config?: EngagespotConfig,
    ) {
        // https://documentation.engagespot.co/docs/rest-api/#section/Authentication
        this.HEADERS = {
            'X-ENGAGESPOT-API-KEY': this.apiKey,
            'X-ENGAGESPOT-API-SECRET': this.apiSecret,
        };
    }

    /**
     * @param url part of url/service. eg: 'notifications' for https://api.engagespot.co/v3/notifications
     * @param data data required to call the API
     * @param headers usually contains auth information along with supplementary data
     * @param method http method like 'GET' and 'POST'
     * @returns API response
     */
    private call(
        url: string,
        data: any,
        headers: AxiosRequestHeaders = this.HEADERS,
        method: Method = 'POST',
    ) {
        return axios({
            url: this.ENDPOINT + url,
            data,
            method,
            headers,
        }).catch((err: AxiosError) => {
            switch (err.response?.status) {
                case 401:
                    throw new AuthFail();
                default:
                    throw err;
            }
        });
    }

    extendHeaders(
        headers: AxiosRequestHeaders,
        current: AxiosRequestHeaders = this.HEADERS,
    ): AxiosRequestHeaders {
        return {
            ...current,
            ...headers,
        };
    }

    /**
     * create a notification instance which can be sent using .send()
     * @param title
     * @returns notification instance
     */
    // https://documentation.engagespot.co/docs/rest-api/#tag/Notifications/paths/~1v3~1notifications/post
    createNotification(title: string) {
        return new Notification(this, title);
    }

    /**
     * send an already prepared notification
     * @param notification body
     * @returns API response
     */
    sendNotification(notification: NotificationSchema) {
        // https://documentation.engagespot.co/docs/rest-api/#tag/Notifications/paths/~1v3~1notifications/post
        return this.call('notifications', notification);
    }

    /**
     * connect/register a user with Engagespot
     * @param userId like 'hello@example.com'
     * @returns API response
     */
    connect(userId: string) {
        let headers = this.extendHeaders({
            'X-ENGAGESPOT-USER-ID': userId,
            'X-ENGAGESPOT-DEVICE-ID': DEVICE_TYPE,
        });

        // append user signature if hmac is enabled
        if (this.config?.enableHmac) {
            headers = this.extendHeaders(
                {
                    'X-ENGAGESPOT-USER-SIGNATURE': this.genHmac(userId),
                },
                headers,
            );
        }

        // https://documentation.engagespot.co/docs/rest-api#tag/SDK/paths/~1v3~1sdk~1connect/post
        return this.call(
            'sdk/connect',
            {
                deviceType: DEVICE_TYPE,
            },
            headers,
        );
    }

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
