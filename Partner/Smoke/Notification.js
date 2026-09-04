import http from 'k6/http';
import { sleep, group, check } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const BASE_URL = __ENV.BASE_URL || 'https://sandbox-bi-core.bucksfield.com.ng';

export const options = {
    VUs: 5,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95<500'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99']
    },
};

//PartnerNotification
export default function () {
    group('noifications', () => {
        const response = http.get(`${BASE_URL}/V1/partners/notifications/unread`);
        check(resonse, {
            'unread: status code is 200': (r) => r.status === 200,
            'unread: body': (r) => r.body.length > 0,
            'unread: response time': (r) => r.timings.duration < 500,
            'unread: has content-type headers': (r) => r.headers['content-type'] !== undefined,
        });
    });
    sleep(1);

    group('noifications', () => {
        const response = http.get(`${BASE_URL}/V1/partners/notifications`);
        check(resonse, {
            'notifications: status code is 200': (r) => r.status === 200,
            'notifications: body': (r) => r.body.length > 0,
            'notifications: response time': (r) => r.timings.duration < 500,
            'notifications: has content-type headers': (r) => r.headers['content-type'] !== undefined,
        });
    });
    sleep(1);

    group('noifications', () => {
        const response = http.patch(`${BASE_URL}/V1/partners/notifications/{deliveryId}/read`);
        check(resonse, {
            'read: status code is 200': (r) => r.status === 200,
            'read: body': (r) => r.body.length > 0,
            'read: response time': (r) => r.timings.duration < 500,
            'read: has content-type headers': (r) => r.headers['content-type'] !== undefined,
        });
    });
    sleep(1);

    group('noifications', () => {
        const response = http.get(`${BASE_URL}/V1/partners/notifications/stream`);
        check(resonse, {
            'stream: status code is 200': (r) => r.status === 200,
            'stream: body': (r) => r.body.length > 0,
            'stream: response time': (r) => r.timings.duration < 500,
            'stream: has content-type headers': (r) => r.headers['content-type'] !== undefined,
        });
    });
    sleep(1);
};
/*export function handleSummary(data)
{
    return {
        "Stress.html": htmlReport(data)
    };
};*/