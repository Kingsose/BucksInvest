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
    group('products', () => {
        const response = http.post(`${BASE_URL}/V1/partners-investment-products`);
        check(resonse, {
            'partners-investment-products: status code is 201': (r) => r.status === 201,
            'partners-investment-products: body': (r) => r.body.length > 0,
            'partners-investment-products: response time': (r) => r.timings.duration < 500,
            'partners-investment-products: has content-type headers': (r) => r.headers['content-type'] !== undefined,
        });
    });
    sleep(1);

    group('products', () => {
        const response = http.get(`${BASE_URL}/V1/partners-investment-products`);
        check(resonse, {
            'partners-investment-products: status code is 200': (r) => r.status === 200,
            'partners-investment-products: body': (r) => r.body.length > 0,
            'partners-investment-products: response time': (r) => r.timings.duration < 500,
            'partners-investment-products: has content-type headers': (r) => r.headers['content-type'] !== undefined,
        });
    });
    sleep(1);

    group('products', () => {
        const response = http.patch(`${BASE_URL}/V1/partners-investment-products/{id}`);
        check(resonse, {
            'id: status code is 200': (r) => r.status === 200,
            'id: body': (r) => r.body.length > 0,
            'id: response time': (r) => r.timings.duration < 500,
            'id: has content-type headers': (r) => r.headers['content-type'] !== undefined,
        });
    });
    sleep(1);

    group('products', () => {
        const response = http.get(`${BASE_URL}/V1/partners-investment-products/mutual-funds/nav`);
        check(resonse, {
            'nav: status code is 200': (r) => r.status === 200,
            'nav: body': (r) => r.body.length > 0,
            'nav: response time': (r) => r.timings.duration < 500,
            'nav: has content-type headers': (r) => r.headers['content-type'] !== undefined,
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