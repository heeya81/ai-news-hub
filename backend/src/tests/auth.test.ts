import request from 'supertest';
import app from '../server.js'; // Ensure your express app is exported from server.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Clean up database before and after tests
beforeAll(async () => {
    await prisma.user.deleteMany({});
});

afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
});

describe('Authentication Endpoints', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
    };

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('success', true);
            // Registration does not return a token, just success message
        });

        it('should not register a duplicate user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toEqual(400); // Expecting existing user error
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login an existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('user');

            // Check for identifying cookies
            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(Array.isArray(cookies)).toBeTruthy();
            const cookieString = cookies.join(' ');
            expect(cookieString).toContain('accessToken');
            expect(cookieString).toContain('refreshToken');
        });

        it('should not login with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
        });
    });
});
