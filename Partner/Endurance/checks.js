import http from 'k6/http';
import { group, check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://sandbox-bi-core.bucksfield.com.ng';

// ── Test data (override via -e on the k6 command line) ──
const TEST_MEMBER_ID = __ENV.TEST_MEMBER_ID || 'REPLACE_WITH_REAL_MEMBER_ID';

function thinking() {
    sleep(Math.random() * 1 + 1); // 1–2s think time, matches original
}

const TRAFFIC_SPLIT = {
    signIn: 0.08,
    verify: 0.07,
    refresh: 0.05,
    signOut: 0.05,
    verifyContact: 0.04,
    profileGet: 0.05,
    profile: 0.06,
    upload: 0.06,
    kyb: 0.08,
    directorsSignature: 0.06,
    document: 0.06,
    members: 0.06,
    membersPost: 0.03,
    forgotPassword: 0.06,
    otpVerification: 0.05,
    resetPassword: 0.05,
    approval: 0.03,
    id: 0.03,
    idDelete: 0.02,
    toggle: 0.01,
};

/*
  ── Throughput threshold math ──
  Peak load  = 100 VUs (stages ramp to 100 for 3.5 min)
  Observed avg iteration_duration in the original (buggy) run was ~1.78s
  (thinking() sleep of 1–2s + request time). That caps total throughput at:
      100 VUs / 1.78s ≈ 56 req/s system-wide at peak
  Per-endpoint expected rate = 56 * TRAFFIC_SPLIT[key].
  Thresholds below are set at ~70% of that expected peak rate as a floor,
  which is realistic for sustained load without demanding more than this
  script can ever generate. Adjust once you have a real baseline run.
*/
const PEAK_VUS = 100;
const AVG_ITERATION_S = 1.78;
const SYSTEM_PEAK_RPS = PEAK_VUS / AVG_ITERATION_S; // ~56 req/s
function floorRate(weight, margin = 0.7) {
    return +(SYSTEM_PEAK_RPS * weight * margin).toFixed(1);
}

export const options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '30s', target: 30 },
        { duration: '30s', target: 40 },
        { duration: '1m', target: 60 },
        { duration: '1.5m', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '2m', target: 0 },
    ],

    thresholds: {
        'http_req_duration': ['p(95)<500', 'p(99)<1000'],
        'http_req_failed': ['rate<0.01'],
        'checks': ['rate>0.99'],

        'http_req_duration{endpoint:/v1/partners/auth/sign-in}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:/v1/partners/auth/sign-in}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/auth/sign-in}': [`rate>=${floorRate(TRAFFIC_SPLIT.signIn)}`],

        'http_req_duration{endpoint:/v1/partners/auth/sign-in/verify}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:/v1/partners/auth/sign-in/verify}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/auth/sign-in/verify}': [`rate>=${floorRate(TRAFFIC_SPLIT.verify)}`],

        'http_req_duration{endpoint:/v1/partners/auth/refresh}': ['p(50)<200', 'p(90)<350', 'p(95)<400', 'p(99)<600'],
        'http_req_failed{endpoint:/v1/partners/auth/refresh}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/auth/refresh}': [`rate>=${floorRate(TRAFFIC_SPLIT.refresh)}`],

        'http_req_duration{endpoint:/v1/partners/auth/sign-out}': ['p(50)<200', 'p(90)<350', 'p(95)<400', 'p(99)<600'],
        'http_req_failed{endpoint:/v1/partners/auth/sign-out}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/auth/sign-out}': [`rate>=${floorRate(TRAFFIC_SPLIT.signOut)}`],

        'http_req_duration{endpoint:/v1/partners/verify-contacts}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:/v1/partners/verify-contacts}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/verify-contacts}': [`rate>=${floorRate(TRAFFIC_SPLIT.verifyContact)}`],

        'http_req_duration{endpoint:/v1/partners/profile-get}': ['p(50)<200', 'p(90)<350', 'p(95)<450', 'p(99)<700'],
        'http_req_failed{endpoint:/v1/partners/profile-get}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/profile-get}': [`rate>=${floorRate(TRAFFIC_SPLIT.profileGet)}`],

        'http_req_duration{endpoint:/v1/partners/profile}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:/v1/partners/profile}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/profile}': [`rate>=${floorRate(TRAFFIC_SPLIT.profile)}`],

        'http_req_duration{endpoint:/v1/partners/upload}': ['p(50)<500', 'p(90)<800', 'p(95)<1000', 'p(99)<2000'],
        'http_req_failed{endpoint:/v1/partners/upload}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/upload}': [`rate>=${floorRate(TRAFFIC_SPLIT.upload)}`],

        'http_req_duration{endpoint:/v1/partners/kyb}': ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
        'http_req_failed{endpoint:/v1/partners/kyb}': ['rate<0.005'],
        'http_reqs{endpoint:/v1/partners/kyb}': [`rate>=${floorRate(TRAFFIC_SPLIT.kyb)}`],

        'http_req_duration{endpoint:/v1/partners/kyb/directors-signature}': ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
        'http_req_failed{endpoint:/v1/partners/kyb/directors-signature}': ['rate<0.005'],
        'http_reqs{endpoint:/v1/partners/kyb/directors-signature}': [`rate>=${floorRate(TRAFFIC_SPLIT.directorsSignature)}`],

        'http_req_duration{endpoint:/v1/partners/kyb/documents}': ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
        'http_req_failed{endpoint:/v1/partners/kyb/documents}': ['rate<0.005'],
        'http_reqs{endpoint:/v1/partners/kyb/documents}': [`rate>=${floorRate(TRAFFIC_SPLIT.document)}`],

        'http_req_duration{endpoint:/v1/partners/members-get}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:/v1/partners/members-get}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/members-get}': [`rate>=${floorRate(TRAFFIC_SPLIT.members)}`],

        'http_req_duration{endpoint:/v1/partners/members-post}': ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
        'http_req_failed{endpoint:/v1/partners/members-post}': ['rate<0.005'],
        'http_reqs{endpoint:/v1/partners/members-post}': [`rate>=${floorRate(TRAFFIC_SPLIT.membersPost)}`],

        'http_req_duration{endpoint:/v1/partners/members/forgot-password}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:/v1/partners/members/forgot-password}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/members/forgot-password}': [`rate>=${floorRate(TRAFFIC_SPLIT.forgotPassword)}`],

        'http_req_duration{endpoint:/v1/partners/members/otp-verification}': ['p(50)<300', 'p(90)<400', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:/v1/partners/members/otp-verification}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/members/otp-verification}': [`rate>=${floorRate(TRAFFIC_SPLIT.otpVerification)}`],

        'http_req_duration{endpoint:/v1/partners/members/reset-password}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:/v1/partners/members/reset-password}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/members/reset-password}': [`rate>=${floorRate(TRAFFIC_SPLIT.resetPassword)}`],

        'http_req_duration{endpoint:/v1/partners/members/approval}': ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
        'http_req_failed{endpoint:/v1/partners/members/approval}': ['rate<0.005'],
        'http_reqs{endpoint:/v1/partners/members/approval}': [`rate>=${floorRate(TRAFFIC_SPLIT.approval)}`],

        'http_req_duration{endpoint:/v1/partners/members/id-get}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:/v1/partners/members/id-get}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/members/id-get}': [`rate>=${floorRate(TRAFFIC_SPLIT.id)}`],

        'http_req_duration{endpoint:/v1/partners/members/id-delete}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:/v1/partners/members/id-delete}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/members/id-delete}': [`rate>=${floorRate(TRAFFIC_SPLIT.idDelete)}`],

        'http_req_duration{endpoint:/v1/partners/members/active-status-toggle}': ['p(50)<200', 'p(90)<350', 'p(95)<400', 'p(99)<600'],
        'http_req_failed{endpoint:/v1/partners/members/active-status-toggle}': ['rate<0.01'],
        'http_reqs{endpoint:/v1/partners/members/active-status-toggle}': [`rate>=${floorRate(TRAFFIC_SPLIT.toggle)}`],
    },
};

// ── Cumulative boundaries for traffic split routing ──
const T = (() => {
    const keys = Object.keys(TRAFFIC_SPLIT);
    const bounds = {};
    let cumulative = 0;
    for (const key of keys) {
        cumulative += TRAFFIC_SPLIT[key];
        bounds[key] = parseFloat(cumulative.toFixed(10));
    }
    return bounds;
})();

export default function () {
    const random = Math.random();
    const headers = { 'Content-Type': 'application/json' };
    // No auth token — every request goes out with just Content-Type.
    // Endpoints that require Authorization will legitimately 401; that's
    // real signal about the API, not a script problem.
    const authHeaders = headers;

    if (random < T.signIn) {
        group('signIn group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/auth/sign-in`,
                { headers, tags: { endpoint: '/v1/partners/auth/refresh' } },
            );
            check(res, { '/v1/partners/auth/sign-in status 200': (r) => r.status === 200 });
        });

    } else if (random < T.verify) {
        group('verify group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/auth/sign-in/verify`,
                null, // TODO: real OTP flow
                { headers, tags: { endpoint: '/v1/partners/auth/sign-in/verify' } }
            );
            check(res, { '/v1/partners/auth/sign-in/verify status 200': (r) => r.status === 200 });
        });

    } else if (random < T.refresh) {
        group('refresh group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/auth/refresh`,
                null, // TODO: real refresh token field
                { headers, tags: { endpoint: '/v1/partners/auth/refresh' } }
            );
            check(res, { '/v1/partners/auth/refresh status 200': (r) => r.status === 200 });
        });

    } else if (random < T.signOut) {
        group('signOut group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/auth/sign-out`,
                null,
                { headers: authHeaders, tags: { endpoint: '/v1/partners/auth/sign-out' } }
            );
            check(res, { '/v1/partners/auth/sign-out status 200': (r) => r.status === 200 });
        });

    } else if (random < T.verifyContact) {
        group('verifyContact group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/verify-contacts`,
                null,
                { headers: authHeaders, tags: { endpoint: '/v1/partners/verify-contacts' } }
            );
            check(res, { '/v1/partners/verify-contacts status 200': (r) => r.status === 200 });
        });

    } else if (random < T.profileGet) {
        group('profileGet group', () => {
            const res = http.get(
                `${BASE_URL}/v1/partners/profile`,
                { headers: authHeaders, tags: { endpoint: '/v1/partners/profile-get' } }
            );
            check(res, { '/v1/partners/profile-get status 200': (r) => r.status === 200 });
        });

    } else if (random < T.profile) {
        group('profile group', () => {
            const res = http.put(
                `${BASE_URL}/v1/partners/profile`,
                null, // TODO: real profile fields
                { headers: authHeaders, tags: { endpoint: '/v1/partners/profile' } }
            );
            check(res, { '/v1/partners/profile status 200': (r) => r.status === 200 });
        });

    } else if (random < T.upload) {
        group('upload group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/upload`,
                null, // TODO: real multipart body if needed
                { headers: authHeaders, tags: { endpoint: '/v1/partners/upload' } }
            );
            check(res, { '/v1/partners/upload status 200': (r) => r.status === 200 });
        });

    } else if (random < T.kyb) {
        group('kyb group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/kyb`,
                null, // TODO: real KYB fields
                { headers: authHeaders, tags: { endpoint: '/v1/partners/kyb' } }
            );
            check(res, { '/v1/partners/kyb status 200': (r) => r.status === 200 });
        });

    } else if (random < T.directorsSignature) {
        group('directorsSignature group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/kyb/directors-signature`,
                null, // TODO: real signature payload
                { headers: authHeaders, tags: { endpoint: '/v1/partners/kyb/directors-signature' } }
            );
            check(res, { '/v1/partners/kyb/directors-signature status 200': (r) => r.status === 200 });
        });

    } else if (random < T.document) {
        group('document group', () => {
            const res = http.get(
                `${BASE_URL}/v1/partners/kyb/documents`,
                { headers: authHeaders, tags: { endpoint: '/v1/partners/kyb/documents' } }
            );
            check(res, { '/v1/partners/kyb/documents status 200': (r) => r.status === 200 });
        });

    } else if (random < T.members) {
        group('members group', () => {
            const res = http.get(
                `${BASE_URL}/v1/partners/members`,
                { headers: authHeaders, tags: { endpoint: '/v1/partners/members-get' } }
            );
            check(res, { '/v1/partners/members status 200': (r) => r.status === 200 });
        });

    } else if (random < T.membersPost) {
        group('membersPost group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/members`,
                null, // TODO: real member fields
                { headers: authHeaders, tags: { endpoint: '/v1/partners/members-post' } }
            );
            check(res, { '/v1/partners/members status 201': (r) => r.status === 201 });
        });

    } else if (random < T.forgotPassword) {
        group('forgotPassword group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/members/forgot-password`,
                null,
                { headers, tags: { endpoint: '/v1/partners/members/forgot-password' } }
            );
            check(res, { '/v1/partners/members/forgot-password status 200': (r) => r.status === 200 });
        });

    } else if (random < T.otpVerification) {
        group('otpVerification group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/members/otp-verification`,
                null, // TODO: real OTP
                { headers, tags: { endpoint: '/v1/partners/members/otp-verification' } }
            );
            check(res, { '/v1/partners/members/otp-verification status 200': (r) => r.status === 200 });
        });

    } else if (random < T.resetPassword) {
        group('resetPassword group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/members/reset-password`,
                null, // TODO: real fields
                { headers, tags: { endpoint: '/v1/partners/members/reset-password' } }
            );
            check(res, { '/v1/partners/members/reset-password status 200': (r) => r.status === 200 });
        });

    } else if (random < T.approval) {
        group('approval group', () => {
            const res = http.post(
                `${BASE_URL}/v1/partners/members/approval`,
                null, // TODO: real fields
                { headers: authHeaders, tags: { endpoint: '/v1/partners/members/approval' } }
            );
            check(res, { '/v1/partners/members/approval status 200': (r) => r.status === 200 });
        });

    } else if (random < T.id) {
        group('id group', () => {
            const res = http.get(
                `${BASE_URL}/v1/partners/members/${TEST_MEMBER_ID}`,
                { headers: authHeaders, tags: { endpoint: '/v1/partners/members/id-get' } }
            );
            check(res, { '/v1/partners/members/id status 200': (r) => r.status === 200 });
        });

    } else if (random < T.idDelete) {
        group('idDelete group', () => {
            const res = http.del(
                `${BASE_URL}/v1/partners/members/${TEST_MEMBER_ID}`,
                null,
                { headers: authHeaders, tags: { endpoint: '/v1/partners/members/id-delete' } }
            );
            check(res, { '/v1/partners/members/id status 200': (r) => r.status === 200 });
        });

    } else {
        group('toggle group', () => {
            const res = http.patch(
                `${BASE_URL}/v1/partners/members/${TEST_MEMBER_ID}/active-status/toggle`,
                null,
                { headers: authHeaders, tags: { endpoint: '/v1/partners/members/active-status-toggle' } }
            );
            check(res, { '/v1/partners/members/{id}/active-status/toggle status 200': (r) => r.status === 200 });
        });
    }

    thinking();
}

/*export function handleSummary(data) {
  return {
    "Load.html": htmlReport(data)
  };
}*/