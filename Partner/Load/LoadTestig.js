import http from 'k6/http';
import { group, sleep, check } from 'k6';

const BASE_URL = __ENV.BASE_URL; 

function thinking() {
  sleep(Math.random() * 1 + 1); // 1–2s think time
}

const TRAFFIC_SPLIT = {
  signIn: 0.07,
  verify: 0.06,
  verifyContact: 0.06,
  contactVerification: 0.06,
  profile: 0.07,
  profileGet: 0.06,
  upload: 0.06,
  kyb: 0.06,
  directorsSignature: 0.06,
  document: 0.05,
  members: 0.06,
  membersPatch: 0.06,
  forgotPassword: 0.05,
  otpVerification: 0.05,
  resetPassword: 0.05,
  id: 0.06,
  idDelete: 0.06,
};

/*
  ── Throughput threshold math ──
  Peak load = 100 VUs. AVG_ITERATION_S below is carried over from a prior
  run — re-measure it from your own clean run's `iteration_duration avg`
  and update this constant so thresholds stay honest.
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
    // No 'check' threshold — this script has no manual check() calls.
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],

    'http_req_duration{endpoint:/v1/partners/auth/sign-in}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/partners/auth/sign-in}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/auth/sign-in}': [`rate>=${floorRate(TRAFFIC_SPLIT.signIn)}`],

    'http_req_duration{endpoint:/v1/partners/auth/sign-in/verify}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/partners/auth/sign-in/verify}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/auth/sign-in/verify}': [`rate>=${floorRate(TRAFFIC_SPLIT.verify)}`],

    'http_req_duration{endpoint:/v1/partners/verify-contact}': ['p(50)<200', 'p(90)<350', 'p(95)<450', 'p(99)<700'],
    'http_req_failed{endpoint:/v1/partners/verify-contact}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/verify-contact}': [`rate>=${floorRate(TRAFFIC_SPLIT.verifyContact)}`],

    'http_req_duration{endpoint:/v1/partners/contact-verification}': ['p(50)<200', 'p(90)<350', 'p(95)<450', 'p(99)<700'],
    'http_req_failed{endpoint:/v1/partners/contact-verification}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/contact-verification}': [`rate>=${floorRate(TRAFFIC_SPLIT.contactVerification)}`],


    'http_req_duration{endpoint:/v1/partners/profile}': ['p(50)<200', 'p(90)<350', 'p(95)<450', 'p(99)<700'],
    'http_req_failed{endpoint:/v1/partners/profile}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/profile}': [`rate>=${floorRate(TRAFFIC_SPLIT.profile)}`],

    'http_req_duration{endpoint:/v1/partners/profile}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/partners/profile}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/profile}': [`rate>=${floorRate(TRAFFIC_SPLIT.profileGet)}`],

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

    'http_req_duration{endpoint:/v1/partners/members/profile}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/partners/members/profile}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/members/profile}': [`rate>=${floorRate(TRAFFIC_SPLIT.members)}`],

    'http_req_duration{endpoint:/v1/partners/members/profile}': ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
    'http_req_failed{endpoint:/v1/partners/members/profile}': ['rate<0.005'],
    'http_reqs{endpoint:/v1/partners/members/profile}': [`rate>=${floorRate(TRAFFIC_SPLIT.membersPatch)}`],

    'http_req_duration{endpoint:/v1/partners/members/forgot-password}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/partners/members/forgot-password}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/members/forgot-password}': [`rate>=${floorRate(TRAFFIC_SPLIT.forgotPassword)}`],

    'http_req_duration{endpoint:/v1/partners/members/otp-verification}': ['p(50)<300', 'p(90)<400', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/partners/members/otp-verification}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/members/otp-verification}': [`rate>=${floorRate(TRAFFIC_SPLIT.otpVerification)}`],

    'http_req_duration{endpoint:/v1/partners/members/reset-password}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/partners/members/reset-password}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/members/reset-password}': [`rate>=${floorRate(TRAFFIC_SPLIT.resetPassword)}`],

    'http_req_duration{endpoint:/v1/partners/members/id}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/partners/members/id}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/members/id}': [`rate>=${floorRate(TRAFFIC_SPLIT.id)}`],

    'http_req_duration{endpoint:/v1/partners/members/id}': ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/partners/members/id}': ['rate<0.01'],
    'http_reqs{endpoint:/v1/partners/members/id}': [`rate>=${floorRate(TRAFFIC_SPLIT.idDelete)}`],
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

let random = Math.floor(Math.random() * 1000000);
let random1 = Math.random().toString(36);
const nameString = `testuser${random1}`;
const name = `Company${random1}`;
const RC = `RC${random}`;
const email = `testuser${random}@alert.com`;
const password = `Password${random}`;
const file = open('./test file.jpeg', 'b');


export default function () {
  let verificationId;
  const random = Math.random();
  const headers = { 'Content-Type': 'application/json' };


  if (random < T.signIn) {
    group('signIn group', () => {
      const response = http.post(
        `${BASE_URL}/v1/partners/auth/sign-in`,
        JSON.stringify({ email: 'wolace@yopmail.com', password: 'Confidence@9' }),
        { headers, tags: { endpoint: '/v1/partners/auth/sign-in' } }
      );
      check(response, {
        '/v1/partners/profile: status is 201': (r) => r.status === 201,
      });
    });

  } else if (random < T.verify) {
    group('verify group', () => {
      const response = http.post(
        `${BASE_URL}/v1/partners/auth/sign-in/verify`,
        JSON.stringify({ 'email': 'wolace@yopmail.com', 'otp': '111111' }),
        { headers, tags: { endpoint: '/v1/partners/auth/sign-in/verify' } }
      );
      check(response, {
        '/v1/partners/profile: status is 201': (r) => r.status === 201,
      });
    });

  } else if (random < T.verifyContact) {
    group('verify group', () => {
      const response = http.post(
        `${BASE_URL}/v1/partners/verify-contact`,
        JSON.stringify({ 'email' : 'wolace@yopmail.com' }),
        { headers, tags: { endpoint: '/v1/partners/verify-contact' } }
      );
      check(response, {
        '/v1/partners/verify-contact: status is 201': (r) => r.status === 201,
      });
      verificationId = response.json().verificationId;
    });

  } else if (random < T.contactVerification) {
    group('verify group', () => {
      if (verificationId) {
        console.error('No verificationId found, skipping confirm step ');
        return;
      }
      const response = http.post(
        `${BASE_URL}/v1/partners/contact-verification`,
        JSON.stringify({ 'otp': '111111', verificationId }),
        { headers, tags: { endpoint: '/v1/partners/contact-verification' } }
      );
      check(response, {
        '/v1/partners/contact-verification': (r) => r.status === 201,
      });
    });

  } else if (random < T.profile) {
    group('profileGet group', () => {
      const response = http.post(
        `${BASE_URL}/v1/partners/profile`,
        JSON.stringify({
          "verificationId": verificationId,
          "companyName": `${name}`,
          "registrationNumber": `${RC}`,
          "companyIndustry": `${nameString}`,
          "companySize": "15",
          "tin": `873199${RC}`,
          "incorporationDate": "2026-08-23T08:12:35.107Z",
          "estimatedAnnualIncome": `${RC}`,
          "companyAddress": "ibeju lekki",
          "state": "Lagos",
          "lga": "Lagos Island",
          "password": "VeryS3cure&$tr0ngPassw0rd",
          "partnerType": "INTERNAL"
        }),
        { headers, tags: { endpoint: '/v1/partners/profile' } }
      );
      check(response, {
        '/v1/partners/profile: status is 201': (r) => r.status === 201,
      })
    });

  } else if (random < T.profileGet) {
    group('profile group', () => {
      const response = http.get(
        `${BASE_URL}/v1/partners/profile`,
        null,
        { headers, tags: { endpoint: '/v1/partners/profile' } }
      );
      check(response, {
        '/v1/partners/profile : status is 200': (r) => r.status === 200,
      });
    });

  } else if (random < T.upload) {
    group('upload group', () => {
      const response = http.post(
        `${BASE_URL}/v1/partners/upload`,
        null,
        { headers, tags: { endpoint: '/v1/partners/upload' } }
      );
      check(response, {
        '/v1/partners/upload: status is 201': (r) => r.status === 201,
      });
    });

  } else if (random < T.kyb) {
    group('kyb group', () => {
      const response = http.get(
        `${BASE_URL}/v1/partners/kyb`,
        null,
        { headers, tags: { endpoint: '/v1/partners/kyb' } }
      );
      check(response, {
        '/v1/partners/kyb: status is 200': (r) => r.status === 200,
      });
    });

  } else if (random < T.directorsSignature) {
    group('directorsSignature group', () => {
      const response = http.post(
        `${BASE_URL}/v1/partners/kyb/directors-signature`,
        JSON.stringify({ "principalDirectorSignatureKey": `${file}`, "secondSignatorySignatureKey": `${file }`}),
        { headers, tags: { endpoint: '/v1/partners/kyb/directors-signature' } }
      );
      check(response, {
        '/v1/partners/kyb/directors-signature : status code is 201': (r) => r.status === 201,
      })
    });

  } else if (random < T.document) {
    group('document group', () => {
      const response = http.post(
        `${BASE_URL}/v1/partners/kyb/documents`,
        JSON.stringify({

          "preferredCommission": 0.05,
          "companyDocuments": {
            "boardResolutionKey": `${file}`,
            "incorporationDocumentKey": `${file}`,
            "memorandumDocumentKey": `${file}`,
            "secCbnKey": `${file}`,
            "utilityBillKey": `${file}`,
            "creditRatingKey": `${file}`,
            "taxClearanceKey": `${file}`
          },
          "settlementBanks": [
            {
              "bankName": `${name}`,
              "accountName": `${nameString}`,
              "accountNumber": `123${RC}`,
              "bvn": `2222${RC}`,
              "bankReferenceLetterKey": `${file}`,
              "latestAuditedAccountKey": `${file}`
            }
          ],
          "signatories": [
            {
              "firstName": `${name}`,
              "lastName": `${name}`,
              "email": `${email}`,
              "phone": `+234813${RC}`,
              "designation": `${nameString}`,
              "nin": "12345678919",
              "meansOfIdentification": "NIN",
              "signatoryIdCardKey": `${file}`
            }
          ]
        }),
        { headers, tags: { endpoint: '/v1/partners/kyb/documents' } }
      );
      check(response, {
        '/v1/partners/kyb/documents: status is 201': (r) => r.status === 201,
      });
    });

  } else if (random < T.members) {
    group('members group', () => {
      const response = http.get(
        `${BASE_URL}/v1/partners/members/profile`,
        { headers, tags: { endpoint: '/v1/partners/members/profile' } }
      );
    });

  } else if (random < T.membersPatch) {
    group('membersPost group', () => {
      const response = http.patch(
        `${BASE_URL}/v1/partners/members/profile`,
        JSON.stringify({
          "email":`${email}`,
          "firstName": `${name}`,
          "lastName": `${nameString}`,
          "phone": `0801${RC}`,
          "role": `${name}`
        }),
        { headers, tags: { endpoint: '/v1/partners/members/profile' } }
      );
      check(response, {
        '/v1/partners/members/profile : status code is 200': (r) => r.status === 200,
      })
    });

  } else if (random < T.forgotPassword) {
    group('forgotPassword group', () => {
      const response = http.post(
        `${BASE_URL}/v1/partners/members/forgot-password`,
        JSON.stringify({
          "email": "walace@yopmial.com",
        }),
        { headers, tags: { endpoint: '/v1/partners/members/forgot-password' } }
      );
      check(response, {
        '/V1/partners/members/reset-password : status code is 201': (r) => r.status === 201,
      });
    });

  } else if (random < T.otpVerification) {
    group('otpVerification group', () => {
      const response = http.post(
        `${BASE_URL}/v1/partners/members/otp-verification`,
        JSON.stringify({
          "email": "walace@yopmail.com",
          "otp": "111111"
        }),
        { headers, tags: { endpoint: '/v1/partners/members/otp-verification' } }
      );
    });

  } else if (random < T.resetPassword) {
    group('resetPassword group', () => {
      const response = http.post(
        `${BASE_URL}/v1/partners/members/reset-password`,
        JSON.stringify({
          "verificationId": verificationId,
          "password": `${password}`,
        }),
        { headers, tags: { endpoint: '/v1/partners/members/reset-password' } }
      );
      check(response, {
        '/V1/partners/members/reset-password : status code is 201': (r) => r.status === 201,
      });
    });

  } else if (random < T.id) {
    group('id group', () => {
      const response = http.patch(
        `${BASE_URL}/v1/partners/members/id`,
        JSON.stringify({
          "firstName": `${name}`,
          "lastName": `${nameString}`,
          "phone": `0801${RC}`,
          "role": `${name}`
        }),
        { headers, tags: { endpoint: '/v1/partners/members/id' } }
      );
      check(response, {
        '/V1/partners/members/reset-password : status code is 201': (r) => r.status === 201,
      });
    });

  } else {
    group('idDelete group', () => {
      const response = http.del(
        `${BASE_URL}/v1/partners/members/id`,
        null,
        { headers, tags: { endpoint: '/v1/partners/members/id' } }
      );
    });
  }

  thinking();
}

/*export function handleSummary(data) {
  return {
    "Load.html": htmlReport(data)
  };
}*/