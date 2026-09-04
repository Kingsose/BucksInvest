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
    group('settings', () => {
        const response = http.get(`${BASE_URL}/V1/settings/roles`);
        check(resonse, {
            'roles: status code is 200': (r) => r.status === 200,
            'roles: body': (r) => r.body.length > 0,
            'roles: response time': (r) => r.timings.duration < 500,
            'roles: has content-type headers': (r) => r.headers['content-type'] !== undefined,
        });
    });
    sleep(1);
    
    group('settings', () => {
        const response = http.get(`${BASE_URL}/V1/settings/banks`);
        check(resonse, {
            'banks: status code is 200': (r) => r.status === 200,
            'banks: body': (r) => r.body.length > 0,
            'banks: response time': (r) => r.timings.duration < 500,
            'banks: has content-type headers': (r) => r.headers['content-type'] !== undefined,
        });
    });
    sleep(1);

    group('settings', () => {
        const response = http.get(`${BASE_URL}/V1/settings/name-enquiry`);
        check(resonse, {
            'name-enquiry: status code is 200': (r) => r.status === 200,
            'name-enquiry: body': (r) => r.body.length > 0,
            'name-enquiry: response time': (r) => r.timings.duration < 500,
            'name-enquiry: has content-type headers': (r) => r.headers['content-type'] !== undefined,
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