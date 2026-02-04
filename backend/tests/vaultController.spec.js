import { jest } from '@jest/globals';
import request from 'supertest';
import { ERROR_CODES } from '../src/config/constants.js';

const mocks = {
    getStatus: jest.fn(),
    getBalance: jest.fn(),
    getTotalDeposits: jest.fn(),
    estimateDeposit: jest.fn(),
    estimateWithdraw: jest.fn(),
};

await jest.unstable_mockModule('../src/services/vaultService.js', () => ({
    VaultService: class VaultService {
        getStatus(...args) {
            return mocks.getStatus(...args);
        }
        getBalance(...args) {
            return mocks.getBalance(...args);
        }
        getTotalDeposits(...args) {
            return mocks.getTotalDeposits(...args);
        }
        estimateDeposit(...args) {
            return mocks.estimateDeposit(...args);
        }
        estimateWithdraw(...args) {
            return mocks.estimateWithdraw(...args);
        }
    },
}));

const { default: app } = await import('../src/index.js');

describe('vault controller', () => {
    const USER_ADDRESS = '0x0000000000000000000000000000000000000001';
    const TOKEN_ADDRESS = '0x0000000000000000000000000000000000000002';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/vault/status', () => {
        test('should get paused false', async () => {
            mocks.getStatus.mockResolvedValueOnce({
                paused: false,
            });

            const response = await request(app)
                .get('/api/vault/status')
                .expect(200);

            expect(mocks.getStatus).toHaveBeenCalledTimes(1);
            expect(response.body).toMatchObject({
                success: true,
                data: { paused: false },
            });
        });

        test('should return 400 when service throws bad request', async () => {
            const error = new Error('No contract');
            error.statusCode = 400;
            error.code = ERROR_CODES.CONTRACT_NOT_INITIALIZED;
            mocks.getStatus.mockRejectedValueOnce(error);

            const response = await request(app)
                .get('/api/vault/status')
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                errorCode: ERROR_CODES.CONTRACT_NOT_INITIALIZED,
            });
        });

        test('should return 500 when service throws', async () => {
            mocks.getStatus.mockRejectedValueOnce(new Error());

            const response = await request(app)
                .get('/api/vault/status')
                .expect(500);

            expect(response.body).toMatchObject({
                success: false,
            });
        });
    });

    describe('GET /api/vault/balance/:userAddress/:tokenAddress', () => {
        test('should return balance', async () => {
            mocks.getBalance.mockResolvedValueOnce({
                balance: '100',
            });

            const response = await request(app)
                .get(`/api/vault/balance/${USER_ADDRESS}/${TOKEN_ADDRESS}`)
                .expect(200);

            expect(mocks.getBalance).toHaveBeenCalledWith(USER_ADDRESS, TOKEN_ADDRESS);
            expect(response.body).toMatchObject({
                success: true,
                data: { balance: '100' },
            });
        });

        test('should return 400 when service throws bad request', async () => {
            const error = new Error('Bad input');
            error.statusCode = 400;
            error.code = ERROR_CODES.CONTRACT_NOT_INITIALIZED;
            mocks.getBalance.mockRejectedValueOnce(error);

            const response = await request(app)
                .get(`/api/vault/balance/${USER_ADDRESS}/${TOKEN_ADDRESS}`)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                errorCode: ERROR_CODES.CONTRACT_NOT_INITIALIZED,
            });
        });

        test('should return 400 when address is invalid', async () => {
            const response = await request(app)
                .get(`/api/vault/balance/not-an-address/${TOKEN_ADDRESS}`)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                errorCode: ERROR_CODES.INVALID_REQUEST,
                errorDetails: {
                    fieldErrors: {
                        userAddress: expect.any(Array),
                    },
                    formErrors: expect.any(Array),
                },
            });
            expect(mocks.getBalance).not.toHaveBeenCalled();
        });

        test('should return 500 when service throws', async () => {
            mocks.getBalance.mockRejectedValueOnce(new Error('boom'));

            const response = await request(app)
                .get(`/api/vault/balance/${USER_ADDRESS}/${TOKEN_ADDRESS}`)
                .expect(500);

            expect(response.body).toMatchObject({
                success: false,
            });
        });
    });

    describe('GET /api/vault/total/:tokenAddress', () => {
        test('should return total deposits', async () => {
            mocks.getTotalDeposits.mockResolvedValueOnce({
                total: '250',
            });

            const response = await request(app)
                .get(`/api/vault/total/${TOKEN_ADDRESS}`)
                .expect(200);

            expect(mocks.getTotalDeposits).toHaveBeenCalledWith(TOKEN_ADDRESS);
            expect(response.body).toMatchObject({
                success: true,
                data: { total: '250' },
            });
        });

        test('should return 400 when service throws bad request', async () => {
            const error = new Error('No token');
            error.statusCode = 400;
            error.code = ERROR_CODES.CONTRACT_NOT_INITIALIZED;
            mocks.getTotalDeposits.mockRejectedValueOnce(error);

            const response = await request(app)
                .get(`/api/vault/total/${TOKEN_ADDRESS}`)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                errorCode: ERROR_CODES.CONTRACT_NOT_INITIALIZED,
            });
        });

        test('should return 400 when token address is invalid', async () => {
            const response = await request(app)
                .get('/api/vault/total/not-an-address')
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                errorCode: ERROR_CODES.INVALID_REQUEST,
                errorDetails: {
                    fieldErrors: {
                        tokenAddress: expect.any(Array),
                    },
                    formErrors: expect.any(Array),
                },
            });
            expect(mocks.getTotalDeposits).not.toHaveBeenCalled();
        });

        test('should return 500 when service throws', async () => {
            mocks.getTotalDeposits.mockRejectedValueOnce(new Error('boom'));

            const response = await request(app)
                .get(`/api/vault/total/${TOKEN_ADDRESS}`)
                .expect(500);

            expect(response.body).toMatchObject({
                success: false,
            });
        });
    });

    describe('POST /api/vault/estimate-deposit', () => {
        test('should return 400 when body missing fields', async () => {

            const response = await request(app)
                .post('/api/vault/estimate-deposit')
                .send({ tokenAddress: TOKEN_ADDRESS })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                errorCode: ERROR_CODES.INVALID_REQUEST,
                errorDetails: {
                    missingFields: ['amount', 'userAddress'],
                    fieldErrors: {
                        amount: expect.any(Array),
                        userAddress: expect.any(Array),
                    },
                    formErrors: expect.any(Array),
                },
            });
            expect(mocks.estimateDeposit).not.toHaveBeenCalled();
        });

        test('should return estimate', async () => {
            mocks.estimateDeposit.mockResolvedValueOnce({
                gas: '12345',
            });

            const payload = {
                tokenAddress: TOKEN_ADDRESS,
                amount: '10',
                userAddress: USER_ADDRESS,
            };

            const response = await request(app)
                .post('/api/vault/estimate-deposit')
                .send(payload)
                .expect(200);

            expect(mocks.estimateDeposit).toHaveBeenCalledWith(
                payload.tokenAddress,
                payload.amount,
                payload.userAddress,
            );
            expect(response.body).toMatchObject({
                success: true,
                data: { gas: '12345' },
            });
        });

        test('should return 400 when service throws bad request', async () => {
            const error = new Error('Estimate failed');
            error.statusCode = 400;
            error.code = ERROR_CODES.CONTRACT_NOT_INITIALIZED;
            mocks.estimateDeposit.mockRejectedValueOnce(error);

            const response = await request(app)
                .post('/api/vault/estimate-deposit')
                .send({
                    tokenAddress: TOKEN_ADDRESS,
                    amount: '10',
                    userAddress: USER_ADDRESS,
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                errorCode: ERROR_CODES.CONTRACT_NOT_INITIALIZED,
            });
        });

        test('should return 400 when address in body is invalid', async () => {
            const response = await request(app)
                .post('/api/vault/estimate-deposit')
                .send({
                    tokenAddress: TOKEN_ADDRESS,
                    amount: '10',
                    userAddress: 'not-an-address',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                errorCode: ERROR_CODES.INVALID_REQUEST,
                errorDetails: {
                    fieldErrors: {
                        userAddress: expect.any(Array),
                    },
                    formErrors: expect.any(Array),
                },
            });
            expect(mocks.estimateDeposit).not.toHaveBeenCalled();
        });

        test('should return 500 when service throws', async () => {
            mocks.estimateDeposit.mockRejectedValueOnce(new Error('boom'));

            const response = await request(app)
                .post('/api/vault/estimate-deposit')
                .send({
                    tokenAddress: TOKEN_ADDRESS,
                    amount: '10',
                    userAddress: USER_ADDRESS,
                })
                .expect(500);

            expect(response.body).toMatchObject({
                success: false,
            });
        });
    });

    describe('POST /api/vault/estimate-withdraw', () => {
        test('should return 400 when body missing fields', async () => {

            const response = await request(app)
                .post('/api/vault/estimate-withdraw')
                .send({ tokenAddress: TOKEN_ADDRESS })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                errorCode: ERROR_CODES.INVALID_REQUEST,
                errorDetails: {
                    missingFields: ['amount', 'userAddress'],
                    fieldErrors: {
                        amount: expect.any(Array),
                        userAddress: expect.any(Array),
                    },
                    formErrors: expect.any(Array),
                },
            });
            expect(mocks.estimateWithdraw).not.toHaveBeenCalled();
        });

        test('should return estimate', async () => {
            mocks.estimateWithdraw.mockResolvedValueOnce({
                gas: '67890',
            });

            const payload = {
                tokenAddress: TOKEN_ADDRESS,
                amount: '5',
                userAddress: USER_ADDRESS,
            };

            const response = await request(app)
                .post('/api/vault/estimate-withdraw')
                .send(payload)
                .expect(200);

            expect(mocks.estimateWithdraw).toHaveBeenCalledWith(
                payload.tokenAddress,
                payload.amount,
                payload.userAddress,
            );
            expect(response.body).toMatchObject({
                success: true,
                data: { gas: '67890' },
            });
        });

        test('should return 400 when service throws bad request', async () => {
            const error = new Error('Estimate failed');
            error.statusCode = 400;
            error.code = ERROR_CODES.CONTRACT_NOT_INITIALIZED;
            mocks.estimateWithdraw.mockRejectedValueOnce(error);

            const response = await request(app)
                .post('/api/vault/estimate-withdraw')
                .send({
                    tokenAddress: TOKEN_ADDRESS,
                    amount: '5',
                    userAddress: USER_ADDRESS,
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                errorCode: ERROR_CODES.CONTRACT_NOT_INITIALIZED,
            });
        });

        test('should return 400 when address in body is invalid', async () => {
            const response = await request(app)
                .post('/api/vault/estimate-withdraw')
                .send({
                    tokenAddress: TOKEN_ADDRESS,
                    amount: '5',
                    userAddress: 'not-an-address',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                errorCode: ERROR_CODES.INVALID_REQUEST,
                errorDetails: {
                    fieldErrors: {
                        userAddress: expect.any(Array),
                    },
                    formErrors: expect.any(Array),
                },
            });
            expect(mocks.estimateWithdraw).not.toHaveBeenCalled();
        });

        test('should return 500 when service throws', async () => {
            mocks.estimateWithdraw.mockRejectedValueOnce(new Error('boom'));

            const response = await request(app)
                .post('/api/vault/estimate-withdraw')
                .send({
                    tokenAddress: TOKEN_ADDRESS,
                    amount: '5',
                    userAddress: USER_ADDRESS,
                })
                .expect(500);

            expect(response.body).toMatchObject({
                success: false,
            });
        });
    });
});
