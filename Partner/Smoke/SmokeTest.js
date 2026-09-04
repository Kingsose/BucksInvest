import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const BASE_URL = __ENV.BASE_URL || 'https://sandbox-bi-core.bucksfield.com.ng';

export const options = {
    vus: 5,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99'],
    },
};

export default function () {

    // /v1/partners/auth/sign-in
    group('sign-in group', () => {
        let random = Math.floor(Math.random());
        const email = `testuser${random}@alert.com`;
        const password = `Password${random}` ;
        const response = http.post(`${BASE_URL}/v1/partners/auth/sign-in`,{
            data: {
                email: email,
                password: password,
            },
        });
        check(response, {
            'sign-in: status is 201': (r) => r.status === 201,
            'sign-in: response time < 500ms': (r) => r.timings.duration < 500,
            'sign-in: body is not empty': (r) => r.body.length > 0,
            'sign-in: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    // /v1/partners/auth/sign-in/verify
    group('verification group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/auth/sign-in/verify`);
        check(response, {
            'verification: status is 201': (r) => r.status === 201,
            'verification: response time < 500ms': (r) => r.timings.duration < 500,
            'verification: body is not empty': (r) => r.body.length > 0,
            'verification: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    // /v1/partners/auth/refresh
    group('refresh-token group', () => {
        const response = http.get(`${BASE_URL}/v1/partners/auth/refresh`);
        check(response, {
            'refresh-token: status is 200': (r) => r.status === 200,
            'refresh-token: response time < 500ms': (r) => r.timings.duration < 500,
            'refresh-token: body is not empty': (r) => r.body.length > 0,
            'refresh-token: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    // /v1/partners/auth//sign-out
    group('sign-out group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/auth//sign-out`);
        check(response, {
            'sign-out: status is 201': (r) => r.status === 201,
            'sign-out: response time < 500ms': (r) => r.timings.duration < 500,
            'sign-out: body is not empty': (r) => r.body.length > 0,
            'sign-out: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    //PARTNER
    // /v1/partners/verify-contacts
    group('verify-contact group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/verify-contacts`);
        check(response, {
            'verify-contact: status is 201': (r) => r.status === 201,
            'verify-contact: response time < 500ms': (r) => r.timings.duration < 500,
            'verify-contact: body is not empty': (r) => r.body.length > 0,
            'verify-contact: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('contact-verification group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/contact-verification`);
        check(response, {
            'contact-verification: status is 201': (r) => r.status === 201,
            'contact-verification: response time < 500ms': (r) => r.timings.duration < 500,
            'contact-verification: body is not empty': (r) => r.body.length > 0,
            'contact-verification: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('profile group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/profile`);
        check(response, {
            'profile: status is 201': (r) => r.status === 201,
            'profile: response time < 500ms': (r) => r.timings.duration < 500,
            'profile: body is not empty': (r) => r.body.length > 0,
            'profile: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('profile group', () => {
        const response = http.get(`${BASE_URL}/v1/partners/profile`);
        check(response, {
            'profile: status is 200': (r) => r.status === 200,
            'profile: response time < 500ms': (r) => r.timings.duration < 500,
            'profile: body is not empty': (r) => r.body.length > 0,
            'profile: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('upload group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/upload`);
        check(response, {
            'upload: status is 201': (r) => r.status === 201,
            'upload: response time < 500ms': (r) => r.timings.duration < 500,
            'upload: body is not empty': (r) => r.body.length > 0,
            'upload: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    //Partners KYB
    group('kyb group', () => {
        const response = http.get(`${BASE_URL}/v1/partners/kyb`);
        check(response, {
            'kyb: status is 200': (r) => r.status === 200,
            'kyb: response time < 500ms': (r) => r.timings.duration < 500,
            'kyb: body is not empty': (r) => r.body.length > 0,
            'kyb: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('kyb group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/kyb/directors-signature`);
        check(response, {
            'director-signature: status is 201': (r) => r.status === 201,
            'director-signature: response time < 500ms': (r) => r.timings.duration < 500,
            'director-signature: body is not empty': (r) => r.body.length > 0,
            'director-signature: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('kyb group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/kyb/documents`);
        check(response, {
            'documents: status is 201': (r) => r.status === 201,
            'documents: response time < 500ms': (r) => r.timings.duration < 500,
            'documents: body is not empty': (r) => r.body.length > 0,
            'documents: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    //Partners Members
    group('Partner group', () => {
        const response = http.get(`${BASE_URL}/v1/partners/members`);
        check(response, {
            'members: status is 200': (r) => r.status === 200,
            'members: response time < 500ms': (r) => r.timings.duration < 500,
            'members: body is not empty': (r) => r.body.length > 0,
            'members: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('Partner group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/members`);
        check(response, {
            'members: status is 201': (r) => r.status === 201,
            'members: response time < 500ms': (r) => r.timings.duration < 500,
            'members: body is not empty': (r) => r.body.length > 0,
            'members: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('Partner group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/members/forgot-password`);
        check(response, {
            'forgot-password: status is 201': (r) => r.status === 201,
            'forgot-password: response time < 500ms': (r) => r.timings.duration < 500,
            'forgot-password: body is not empty': (r) => r.body.length > 0,
            'forgot-password: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('Partner group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/members/otp-verification`);
        check(response, {
            'otp-verification: status is 201': (r) => r.status === 201,
            'otp-verification: response time < 500ms': (r) => r.timings.duration < 500,
            'otp-verification: body is not empty': (r) => r.body.length > 0,
            'otp-verification: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('Partner group', () => {
        const response = http.post(`${BASE_URL}/v1/partners/members/reset-password`);
        check(response, {
            'reset-password: status is 201': (r) => r.status === 201,
            'reset-password: response time < 500ms': (r) => r.timings.duration < 500,
            'reset-password: body is not empty': (r) => r.body.length > 0,
            'reset-password: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('Partner group', () => {
        const response = http.get(`${BASE_URL}/v1/partners/members/profile`);
        check(response, {
            'profile: status is 200': (r) => r.status === 200,
            'profile: response time < 500ms': (r) => r.timings.duration < 500,
            'profile: body is not empty': (r) => r.body.length > 0,
            'profile: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('Partner group', () => {
        const response = http.patch(`${BASE_URL}/v1/partners/members/profile`);
        check(response, {
            'profile: status is 200': (r) => r.status === 200,
            'profile: response time < 500ms': (r) => r.timings.duration < 500,
            'profile: body is not empty': (r) => r.body.length > 0,
            'profile: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('Partner group', () => {
        const response = http.patch(`${BASE_URL}/v1/partners/members/approval`);
        check(response, {
            'approval: status is 200': (r) => r.status === 200,
            'approval: response time < 500ms': (r) => r.timings.duration < 500,
            'approval: body is not empty': (r) => r.body.length > 0,
            'approval: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('Partner group', () => {
        const response = http.patch(`${BASE_URL}/v1/partners/members/id`);
        check(response, {
            'id: status is 200': (r) => r.status === 200,
            'id: response time < 500ms': (r) => r.timings.duration < 500,
            'id: body is not empty': (r) => r.body.length > 0,
            'id: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('Partner group', () => {
        const response = http.delete(`${BASE_URL}/v1/partners/members/id`);
        check(response, {
            'id: status is 200': (r) => r.status === 200,
            'id: response time < 500ms': (r) => r.timings.duration < 500,
            'id: body is not empty': (r) => r.body.length > 0,
            'id: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    group('Partner group', () => {
        const response = http.patch(`${BASE_URL}/v1/partners/members/{id}/active-status/toggle`);
        check(response, {
            'toggle: status is 200': (r) => r.status === 200,
            'toggle: response time < 500ms': (r) => r.timings.duration < 500,
            'toggle: body is not empty': (r) => r.body.length > 0,
            'toggle: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    console.log(`I am VU number: ${__VU}`);           
    console.log(`This is my iteration: ${__ITER}`)
};

/*export function handleSummary(data)
{
    return {
        "Stress.html": htmlReport(data)
    };
};*/
