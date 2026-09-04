import http from 'k6/http';
import { group, sleep, check } from 'k6';

const BASE_URL = __ENV.BASE_URL;

//  Think Time 
function thinking() {
  sleep(Math.random() * 1 + 1); // 1–2s think time
}

//  Traffic Split — must equal exactly 1.00 
const TRAFFIC_SPLIT = {
  signIn: 0.07,
  newOtp: 0.06,
  verify: 0.06,
  verifyContact: 0.05,
  contactVerification: 0.05,
  profileIndividual: 0.05,
  profileCorporate: 0.05,
  upload: 0.05,
  requestVerification: 0.05,
  withdrawalVerification: 0.05,
  WithdrawalAcct: 0.05,
  withdrawals: 0.05,
  fixedIncome: 0.03,
  mutualFunds: 0.03,
  products: 0.02,
  fixedIncomeID: 0.03,
  mutualFundID: 0.02,
  investment: 0.03,
  redeem: 0.02,
  wallet: 0.02,
  recentWallet: 0.02,
  walletByPhone: 0.01,
  walletBalance: 0.01,
  walletTransaction: 0.01,
  accountDetails: 0.01,
  passwordPatch: 0.03,
  password: 0.03,
  ForgotPassword: 0.02,
  passwordResetId: 0.01,
  resetPassword: 0.01,
};

/*
   Throughput threshold math 
  Peak load = 500 VUs. Update AVG_ITERATION_S from your own
  clean run's iteration_duration avg to keep thresholds honest.
*/
const PEAK_VUS = 500;
const AVG_ITERATION_S = 1.78;
const SYSTEM_PEAK_RPS = PEAK_VUS / AVG_ITERATION_S; // ~281 req/s

function floorRate(weight, margin = 0.7) {
  return +(SYSTEM_PEAK_RPS * weight * margin).toFixed(1);
}

//  Options 
export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '400s', target: 60 },
    { duration: '1m', target: 150 },
    { duration: '1m', target: 250 },
    { duration: '2m', target: 500 },
    { duration: '1m', target: 600 },
    { duration: '3m', target: 600 },
    { duration: '1m30s', target: 350 },
    { duration: '2m', target: 0 },
  ],

  thresholds: {
    //  Global 
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    'checks': ['rate>0.99'],

    //  signIn 
    'http_req_duration{endpoint:/v1/auth/sign-in}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/auth/sign-in}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/auth/sign-in}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.signIn)}`],

    //  newOtp 
    'http_req_duration{endpoint:/v1/auth/new-otp}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/auth/new-otp}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/auth/new-otp}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.newOtp)}`],

    //  verify 
    'http_req_duration{endpoint:/v1/auth/sign-in/verify}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/auth/sign-in/verify}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/auth/sign-in/verify}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.verify)}`],

    //  verifyContact 
    'http_req_duration{endpoint:/v1/users/verify-contact}':
      ['p(50)<200', 'p(90)<350', 'p(95)<450', 'p(99)<700'],
    'http_req_failed{endpoint:/v1/users/verify-contact}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/users/verify-contact}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.verifyContact)}`],

    //  contactVerification 
    'http_req_duration{endpoint:/v1/users/contact-otp/verify}':
      ['p(50)<200', 'p(90)<350', 'p(95)<450', 'p(99)<700'],
    'http_req_failed{endpoint:/v1/users/contact-otp/verify}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/users/contact-otp/verify}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.contactVerification)}`],

    //  profileIndividual 
    'http_req_duration{endpoint:/v1/users/profile/individual}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/users/profile/individual}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/users/profile/individual}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.profileIndividual)}`],

    //  profileCorporate 
    'http_req_duration{endpoint:/v1/users/profile/corporate}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/users/profile/corporate}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/users/profile/corporate}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.profileCorporate)}`],

    //  upload 
    'http_req_duration{endpoint:/v1/users/upload}':
      ['p(50)<500', 'p(90)<800', 'p(95)<1000', 'p(99)<2000'],
    'http_req_failed{endpoint:/v1/users/upload}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/users/upload}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.upload)}`],

    //  requestVerification 
    'http_req_duration{endpoint:/v1/users/withdrawal-accounts/request-verification}':
      ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
    'http_req_failed{endpoint:/v1/users/withdrawal-accounts/request-verification}':
      ['rate<0.005'],
    'http_reqs{endpoint:/v1/users/withdrawal-accounts/request-verification}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.requestVerification)}`],

    //  withdrawalVerification 
    'http_req_duration{endpoint:/v1/users/withdrawal-accounts/verify}':
      ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
    'http_req_failed{endpoint:/v1/users/withdrawal-accounts/verify}':
      ['rate<0.005'],
    'http_reqs{endpoint:/v1/users/withdrawal-accounts/verify}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.withdrawalVerification)}`],

    //  WithdrawalAcct 
    'http_req_duration{endpoint:/v1/users/withdrawal-accounts}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/users/withdrawal-accounts}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/users/withdrawal-accounts}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.WithdrawalAcct)}`],

    //  withdrawals 
    'http_req_duration{endpoint:/v1/withdrawals}':
      ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
    'http_req_failed{endpoint:/v1/withdrawals}':
      ['rate<0.005'],
    'http_reqs{endpoint:/v1/withdrawals}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.withdrawals)}`],

    //  fixedIncome 
    'http_req_duration{endpoint:/v1/investments/fixed-income}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/investments/fixed-income}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/investments/fixed-income}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.fixedIncome)}`],

    //  mutualFunds 
    'http_req_duration{endpoint:/v1/investments/mutual-funds}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/investments/mutual-funds}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/investments/mutual-funds}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.mutualFunds)}`],

    //  products 
    'http_req_duration{endpoint:/v1/investments/products}':
      ['p(50)<200', 'p(90)<350', 'p(95)<450', 'p(99)<700'],
    'http_req_failed{endpoint:/v1/investments/products}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/investments/products}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.products)}`],

    //  fixedIncomeID 
    'http_req_duration{endpoint:/v1/investments/fixed-income/id}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/investments/fixed-income/id}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/investments/fixed-income/id}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.fixedIncomeID)}`],

    //  mutualFundID 
    'http_req_duration{endpoint:/v1/investments/mutual-fund/id}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/investments/mutual-fund/id}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/investments/mutual-fund/id}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.mutualFundID)}`],

    //  investment 
    'http_req_duration{endpoint:/v1/investments}':
      ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
    'http_req_failed{endpoint:/v1/investments}':
      ['rate<0.005'],
    'http_reqs{endpoint:/v1/investments}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.investment)}`],

    //  redeem 
    'http_req_duration{endpoint:/v1/investments/redeem}':
      ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
    'http_req_failed{endpoint:/v1/investments/redeem}':
      ['rate<0.005'],
    'http_reqs{endpoint:/v1/investments/redeem}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.redeem)}`],

    //  wallet 
    'http_req_duration{endpoint:/v1/wallet/mutuals}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/wallet/mutuals}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/wallet/mutuals}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.wallet)}`],

    //  recentWallet 
    'http_req_duration{endpoint:/v1/wallet/mutuals/recent}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/wallet/mutuals/recent}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/wallet/mutuals/recent}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.recentWallet)}`],

    //  walletByPhone 
    'http_req_duration{endpoint:/v1/wallets/find-user-by-phone}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/wallets/find-user-by-phone}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/wallets/find-user-by-phone}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.walletByPhone)}`],

    //  walletBalance 
    'http_req_duration{endpoint:/v1/wallet/balance}':
      ['p(50)<200', 'p(90)<350', 'p(95)<450', 'p(99)<700'],
    'http_req_failed{endpoint:/v1/wallet/balance}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/wallet/balance}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.walletBalance)}`],

    //  walletTransaction 
    'http_req_duration{endpoint:/v1/wallet/transactions}':
      ['p(50)<200', 'p(90)<350', 'p(95)<450', 'p(99)<700'],
    'http_req_failed{endpoint:/v1/wallet/transactions}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/wallet/transactions}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.walletTransaction)}`],

    //  accountDetails 
    'http_req_duration{endpoint:/v1/wallet/account-details}':
      ['p(50)<200', 'p(90)<350', 'p(95)<450', 'p(99)<700'],
    'http_req_failed{endpoint:/v1/wallet/account-details}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/wallet/account-details}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.accountDetails)}`],

    //  passwordPatch (PATCH) 
    'http_req_duration{endpoint:/v1/users/password-patch}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/users/password-patch}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/users/password-patch}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.passwordPatch)}`],

    //  password (GET) 
    'http_req_duration{endpoint:/v1/users/password}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/users/password}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/users/password}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.password)}`],

    //  ForgotPassword 
    'http_req_duration{endpoint:/v1/users/forgot-password}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/users/forgot-password}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/users/forgot-password}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.ForgotPassword)}`],

    //  passwordResetId 
    'http_req_duration{endpoint:/v1/users/password-reset/verify-otp}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/users/password-reset/verify-otp}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/users/password-reset/verify-otp}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.passwordResetId)}`],

    //  resetPassword 
    'http_req_duration{endpoint:/v1/users/reset-password}':
      ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
    'http_req_failed{endpoint:/v1/users/reset-password}':
      ['rate<0.01'],
    'http_reqs{endpoint:/v1/users/reset-password}':
      [`rate>=${floorRate(TRAFFIC_SPLIT.resetPassword)}`],
  },
};

//  Cumulative boundaries 
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

//  Random test data 
const randomInt = Math.floor(Math.random() * 1000000);
function randomLetters(length = 6) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet[Math.floor(Math.random() * 26)];
  }
  return result;
}
const randomStr = randomLetters(6);
const nameString = `testuser${randomStr}`;
const name = `Company${randomStr}`;
const RC = `RC${randomInt}`;

//  Default Function 
export default function () {
  const random = Math.random();
  const headers = { 'Content-Type': 'application/json' };

  // declared outside groups so values can flow between them
  let userId;
  let uuId;
  let contactVerificationId;
  let passwordResetId;

  //  signIn (0.00 – 0.07) 
  if (random < T.signIn) {
    group('signIn group', () => {
      const response = http.post(
        `${BASE_URL}/v1/auth/sign-in`,
        JSON.stringify({ email: 'test01@sharklasers.com', password: 'Neymar%20' }),
        { headers, tags: { endpoint: '/v1/auth/sign-in' } }
      );
      check(response, {
        '/v1/auth/sign-in: status is 201': (r) => r.status === 201,
      });
      userId = response.json('user.id') || '';
    });

    //  newOtp (0.07 – 0.13) 
  } else if (random < T.newOtp) {
    group('newOtp group', () => {
      const response = http.post(
        `${BASE_URL}/v1/auth/new-otp`,
        JSON.stringify({ email: 'test01@sharklasers.com' }),
        { headers, tags: { endpoint: '/v1/auth/new-otp' } }
      );
      check(response, {
        '/v1/auth/new-otp: status is 201': (r) => r.status === 201,
      });
    });

    //  verify (0.13 – 0.19) 
  } else if (random < T.verify) {
    group('verify group', () => {
      const response = http.post(
        `${BASE_URL}/v1/auth/sign-in/verify`,
        JSON.stringify({ userId: userId, otp: '111111' }),
        { headers, tags: { endpoint: '/v1/auth/sign-in/verify' } }
      );
      check(response, {
        '/v1/auth/sign-in/verify: status is 201': (r) => r.status === 201,
      });
    });

    //  verifyContact (0.19 – 0.24) 
  } else if (random < T.verifyContact) {
    group('verifyContact group', () => {
      const response = http.post(
        `${BASE_URL}/v1/users/verify-contact`,
        JSON.stringify({ email: 'test01@sharklasers.com', phone: `0801${randomInt}` }),
        { headers, tags: { endpoint: '/v1/users/verify-contact' } }
      );
      check(response, {
        '/v1/users/verify-contact: status is 201': (r) => r.status === 201,
      });
      contactVerificationId = response.json('contactVerificationId') || '';
    });

    //  contactVerification (0.24 – 0.29) 
  } else if (random < T.contactVerification) {
    group('contactVerification group', () => {
      const response = http.post(
        `${BASE_URL}/v1/users/contact-otp/verify`,
        JSON.stringify({ contactVerificationId: contactVerificationId, otp: '111111' }),
        { headers, tags: { endpoint: '/v1/users/contact-otp/verify' } }
      );
      check(response, {
        '/v1/users/contact-otp/verify: status is 201': (r) => r.status === 201,
      });
    });

    //  profileIndividual (0.29 – 0.34) 
  } else if (random < T.profileIndividual) {
    group('profileIndividual group', () => {
      const response = http.post(
        `${BASE_URL}/v1/users/profile/individual`,
        JSON.stringify({
          contactVerificationId: contactVerificationId,
          title: 'Mr.',
          firstName: `${name}`,
          middleName: `${nameString}`,
          lastName: `${name}`,
          mothersMaidenName: `Aregbe${name}`,
          dob: '2000-01-01T00:00:00.000Z',
          nationality: 'Nigerian',
          gender: 'MALE',
          residentialAddress: '123 Main St',
          city: 'Lagos',
          lga: 'Kosofe',
          state: 'Lagos',
          countryOfTax: 'Nigeria',
          referralCode: 'REF12345',
        }),
        { headers, tags: { endpoint: '/v1/users/profile/individual' } }
      );
      check(response, {
        '/v1/users/profile/individual: status is 201': (r) => r.status === 201,
      });
    });

    //  profileCorporate (0.34 – 0.39) 
  } else if (random < T.profileCorporate) {
    group('profileCorporate group', () => {
      const response = http.post(
        `${BASE_URL}/v1/users/profile/corporate`,
        JSON.stringify({
          contactVerificationId: contactVerificationId,
          companyName: `${name}`,
          organizationType: `${nameString}`,
          primaryContactNationality: 'Nigerian',
          principalContactFirstName: `John${name}`,
          principalContactLastName: `John${nameString}`,
          stateOfOrigin: 'Lagos',
          tin: `100000${RC}`,
          dateIncorporated: '2000-01-01T00:00:00.000Z',
          incorporationNumber: `RC${RC}`,
          businessAddress: '123 Main St',
          state: 'Lagos',
          lga: 'Ojo',
          city: 'Yaba',
          businessPhone: `0801${randomInt}`,
          referralCode: 'REF12345',
        }),
        { headers, tags: { endpoint: '/v1/users/profile/corporate' } }
      );
      check(response, {
        '/v1/users/profile/corporate: status is 201': (r) => r.status === 201,
      });
    });

    //  upload (0.39 – 0.44) 
  } else if (random < T.upload) {
    group('upload group', () => {
      const fileContent = open('../data/testfile.pdf', 'b');
      const response = http.post(
        `${BASE_URL}/v1/users/upload`,
        { file: http.file(fileContent, 'testfile.pdf', 'application/pdf') },
        { tags: { endpoint: '/v1/users/upload' } }
      );
      check(response, {
        '/v1/users/upload: status is 201': (r) => r.status === 201,
      });
    });

    //  requestVerification (0.44 – 0.49) 
  } else if (random < T.requestVerification) {
    group('requestVerification group', () => {
      const response = http.post(
        `${BASE_URL}/v1/users/withdrawal-accounts/request-verification`,
        JSON.stringify({ accountNumber: `123${randomInt}`, bankCode: `001${randomInt}` }),
        { headers, tags: { endpoint: '/v1/users/withdrawal-accounts/request-verification' } }
      );
      check(response, {
        '/v1/users/withdrawal-accounts/request-verification: status is 201': (r) => r.status === 201,
      });
    });

    //  withdrawalVerification (0.49 – 0.54) 
  } else if (random < T.withdrawalVerification) {
    group('withdrawalVerification group', () => {
      const response = http.post(
        `${BASE_URL}/v1/users/withdrawal-accounts/verify`,
        JSON.stringify({ otp: '111111' }),
        { headers, tags: { endpoint: '/v1/users/withdrawal-accounts/verify' } }
      );
      check(response, {
        '/v1/users/withdrawal-accounts/verify: status is 201': (r) => r.status === 201,
      });
    });

    //  WithdrawalAcct (0.54 – 0.59) 
  } else if (random < T.WithdrawalAcct) {
    group('WithdrawalAcct group', () => {
      const response = http.get(
        `${BASE_URL}/v1/users/withdrawal-accounts`,
        { headers, tags: { endpoint: '/v1/users/withdrawal-accounts' } }
      );
      check(response, {
        '/v1/users/withdrawal-accounts: status is 200': (r) => r.status === 200,
      });
      uuId = response.json('data.id') || '';
    });

    //  withdrawals (0.59 – 0.64) 
  } else if (random < T.withdrawals) {
    group('withdrawals group', () => {
      const response = http.post(
        `${BASE_URL}/v1/withdrawals`,
        JSON.stringify({
          amount: 10000.00,
          currency: 'NGN',
          withdrawalAccountId: uuId,
          pin: '1234',
          securityQuestionId: 'a536a76d-b771-4a80-a77a-c1cfdd3b4604',
          securityQuestionAnswer: 'Blue',
        }),
        { headers, tags: { endpoint: '/v1/withdrawals' } }
      );
      check(response, {
        '/v1/withdrawals: status is 201': (r) => r.status === 201,
      });
    });

    //  fixedIncome (0.64 – 0.67) 
  } else if (random < T.fixedIncome) {
    group('fixedIncome group', () => {
      const response = http.get(
        `${BASE_URL}/v1/investments/fixed-income?productType=TREASURY_BILL`,
        { headers, tags: { endpoint: '/v1/investments/fixed-income' } }
      );
      check(response, {
        '/v1/investments/fixed-income: status is 200': (r) => r.status === 200,
      });
    });

    //  mutualFunds (0.67 – 0.70) 
  } else if (random < T.mutualFunds) {
    group('mutualFunds group', () => {
      const response = http.get(
        `${BASE_URL}/v1/investments/mutual-funds`,
        { headers, tags: { endpoint: '/v1/investments/mutual-funds' } }
      );
      check(response, {
        '/v1/investments/mutual-funds: status is 200': (r) => r.status === 200,
      });
    });

    //  products (0.70 – 0.72) 
  } else if (random < T.products) {
    group('products group', () => {
      const response = http.get(
        `${BASE_URL}/v1/investments/products`,
        { headers, tags: { endpoint: '/v1/investments/products' } }
      );
      check(response, {
        '/v1/investments/products: status is 200': (r) => r.status === 200,
      });
    });

    //  fixedIncomeID (0.72 – 0.75) 
  } else if (random < T.fixedIncomeID) {
    group('fixedIncomeID group', () => {
      const response = http.get(
        `${BASE_URL}/v1/investments/fixed-income/234`,
        { headers, tags: { endpoint: '/v1/investments/fixed-income/id' } }
      );
      check(response, {
        '/v1/investments/fixed-income/id: status is 200': (r) => r.status === 200,
      });
    });

    //  mutualFundID (0.75 – 0.77) 
  } else if (random < T.mutualFundID) {
    group('mutualFundID group', () => {
      const response = http.get(
        `${BASE_URL}/v1/investments/mutual-fund/234`,
        { headers, tags: { endpoint: '/v1/investments/mutual-fund/id' } }
      );
      check(response, {
        '/v1/investments/mutual-fund/id: status is 200': (r) => r.status === 200,
      });
    });

    //  investment (0.77 – 0.80) 
  } else if (random < T.investment) {
    group('investment group', () => {
      const response = http.post(
        `${BASE_URL}/v1/investments`,
        JSON.stringify({
          productType: 'TREASURY_BILL',
          amountToInvest: 18000,
          productId: '550e8400-e29b-41d4-a716-446655440000',
          rolloverEnabled: true,
          rolloverMode: 'PRINCIPAL_ONLY',
        }),
        { headers, tags: { endpoint: '/v1/investments' } }
      );
      check(response, {
        '/v1/investments: status is 201': (r) => r.status === 201,
      });
    });

    //  redeem (0.80 – 0.82) 
  } else if (random < T.redeem) {
    group('redeem group', () => {
      const response = http.post(
        `${BASE_URL}/v1/investments/redeem`,
        JSON.stringify({
          productId: '550e8400-e29b-41d4-a716-446655440000',
          unitsToRedeem: 105,
          pin: '1234',
        }),
        { headers, tags: { endpoint: '/v1/investments/redeem' } }
      );
      check(response, {
        '/v1/investments/redeem: status is 201': (r) => r.status === 201,
      });
    });

    //  wallet (0.82 – 0.84) 
  } else if (random < T.wallet) {
    group('wallet group', () => {
      const response = http.post(
        `${BASE_URL}/v1/wallet/mutuals`,
        JSON.stringify({ phones: [`0801${randomInt}`] }),
        { headers, tags: { endpoint: '/v1/wallet/mutuals' } }
      );
      check(response, {
        '/v1/wallet/mutuals: status is 200 or 201': (r) => r.status === 200 || r.status === 201,
      });
    });

    //  recentWallet (0.84 – 0.86) 
  } else if (random < T.recentWallet) {
    group('recentWallet group', () => {
      const response = http.post(
        `${BASE_URL}/v1/wallet/mutuals/recent`,
        JSON.stringify({ phones: [`0801${randomInt}`] }),
        { headers, tags: { endpoint: '/v1/wallet/mutuals/recent' } }
      );
      check(response, {
        '/v1/wallet/mutuals/recent: status is 200 or 201': (r) => r.status === 200 || r.status === 201,
      });
    });

    //  walletByPhone (0.86 – 0.87) 
  } else if (random < T.walletByPhone) {
    group('walletByPhone group', () => {
      const response = http.post(
        `${BASE_URL}/v1/wallets/find-user-by-phone`,
        JSON.stringify({ phone: `0801${randomInt}` }),
        { headers, tags: { endpoint: '/v1/wallets/find-user-by-phone' } }
      );
      check(response, {
        '/v1/wallets/find-user-by-phone: status is 200 or 201': (r) => r.status === 200 || r.status === 201,
      });
    });

    //  walletBalance (0.87 – 0.88) 
  } else if (random < T.walletBalance) {
    group('walletBalance group', () => {
      const response = http.get(
        `${BASE_URL}/v1/wallet/balance`,
        { headers, tags: { endpoint: '/v1/wallet/balance' } }
      );
      check(response, {
        '/v1/wallet/balance: status is 200': (r) => r.status === 200,
      });
    });

    //  walletTransaction (0.88 – 0.89) 
  } else if (random < T.walletTransaction) {
    group('walletTransaction group', () => {
      const response = http.get(
        `${BASE_URL}/v1/wallet/transactions`,
        { headers, tags: { endpoint: '/v1/wallet/transactions' } }
      );
      check(response, {
        '/v1/wallet/transactions: status is 200': (r) => r.status === 200,
      });
    });

    //  accountDetails (0.89 – 0.90) 
  } else if (random < T.accountDetails) {
    group('accountDetails group', () => {
      const response = http.get(
        `${BASE_URL}/v1/wallet/account-details`,
        { headers, tags: { endpoint: '/v1/wallet/account-details' } }
      );
      check(response, {
        '/v1/wallet/account-details: status is 200': (r) => r.status === 200,
      });
    });

    //  passwordPatch (0.90 – 0.93) 
  } else if (random < T.passwordPatch) {
    group('passwordPatch group', () => {
      const response = http.patch(
        `${BASE_URL}/v1/users/password`,
        JSON.stringify({ oldPassword: 'Neymar%20', newPassword: 'Neymar%21' }),
        { headers, tags: { endpoint: '/v1/users/password-patch' } }
      );
      check(response, {
        '/v1/users/password PATCH: status is 201': (r) => r.status === 201,
      });
    });

    //  password GET (0.93 – 0.96) 
  } else if (random < T.password) {
    group('password group', () => {
      const response = http.get(
        `${BASE_URL}/v1/users/password`,
        { headers, tags: { endpoint: '/v1/users/password' } }
      );
      check(response, {
        '/v1/users/password GET: status is 200': (r) => r.status === 200,
      });
    });

    //  ForgotPassword (0.96 – 0.98) 
  } else if (random < T.ForgotPassword) {
    group('ForgotPassword group', () => {
      const response = http.post(
        `${BASE_URL}/v1/users/forgot-password`,
        JSON.stringify({
          email: 'test01@sharklasers.com',
          phone: `0801${randomInt}`,
        }),
        { headers, tags: { endpoint: '/v1/users/forgot-password' } }
      );
      check(response, {
        '/v1/users/forgot-password: status is 201': (r) => r.status === 201,
      });
      passwordResetId = response.json('data.passwordResetId') || '';
    });

    //  passwordResetId (0.98 – 0.99) 
  } else if (random < T.passwordResetId) {
    group('passwordResetId group', () => {
      const response = http.post(
        `${BASE_URL}/v1/users/password-reset/verify-otp`,
        JSON.stringify({ passwordResetId: passwordResetId, otp: '111111' }),
        { headers, tags: { endpoint: '/v1/users/password-reset/verify-otp' } }
      );
      check(response, {
        '/v1/users/password-reset/verify-otp: status is 201': (r) => r.status === 201,
      });
    });

    //  resetPassword (0.99 – 1.00) 
  } else {
    group('resetPassword group', () => {
      const response = http.post(
        `${BASE_URL}/v1/users/reset-password`,
        JSON.stringify({
          passwordResetId: passwordResetId,
          password: 'Neymar%22',
        }),
        { headers, tags: { endpoint: '/v1/users/reset-password' } }
      );
      check(response, {
        '/v1/users/reset-password: status is 201': (r) => r.status === 201,
      });
    });
  }

  thinking();
}