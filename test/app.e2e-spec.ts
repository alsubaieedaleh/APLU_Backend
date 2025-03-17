import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

jest.setTimeout(60000); // Increase timeout for long-running async operations

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authToken: string; // Token for the test student user
  let userId: string;    // Test student's user ID

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret'; // Set JWT secret for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
  
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  
    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.setGlobalPrefix('api');
    await app.init();
  });
  
  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    await mongoose.disconnect();
  });
  
  describe('Auth', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'Test123!',
      fullName: 'Test User',
      role: 'Student',
    };
  
    it('/api/auth/register (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
  
      userId = response.body._id;
      expect(response.body.email).toBe(testUser.email);
    });
  
    it('/api/auth/login (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(testUser)
        .expect(201);
  
      authToken = response.body.access_token;
      expect(authToken).toBeDefined();
    });
  
    it('/api/auth/logout (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .expect(res => {
          expect(res.body.message).toBe('Logout successful');
        });
    });
  
    it('/api/auth/refresh-token (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh-token')
        .send({ refreshToken: authToken })
        .expect(201);
  
      expect(response.body.access_token).toBeDefined();
    });
  
    it('/api/auth/oauth (POST) for Google login', async () => {
      const googleUser = {
        provider: 'google',
        email: 'googleuser@example.com',
        firstName: 'Google',
        lastName: 'User',
      };
  
      const response = await request(app.getHttpServer())
        .post('/api/auth/oauth')
        .send(googleUser)
        .expect(201);
  
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(googleUser.email);
    });
  });
  
  describe('User API', () => {
    let adminToken: string;
    let adminUserId: string;
  
    // Create an admin user to test admin-protected endpoints.
    beforeAll(async () => {
      const adminUser = {
        email: 'admin@example.com',
        password: 'Admin123!',
        fullName: 'Admin User',
        role: 'Admin',
      };
      const resRegister = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(adminUser)
        .expect(201);
      adminUserId = resRegister.body._id;
      const resLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(adminUser)
        .expect(201);
      adminToken = resLogin.body.access_token;
    });
  
    it('GET /api/users/:id (Get user details)', () => {
      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.email).toBe('test@example.com');
        });
    });
  
    it('PATCH /api/users/:id (Update user profile)', async () => {
      const updatedData = { fullName: 'Updated Test User' };
      const response = await request(app.getHttpServer())
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);
      expect(response.body.fullName).toBe(updatedData.fullName);
    });
  
    it('DELETE /api/users/:id (Delete user account)', async () => {
      // Create a new user for deletion.
      const deleteUser = {
        email: 'delete@example.com',
        password: 'Delete123!',
        fullName: 'Delete User',
        role: 'Student',
      };
      const resReg = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(deleteUser)
        .expect(201);
      const deleteUserId = resReg.body._id;
      await request(app.getHttpServer())
        .delete(`/api/users/${deleteUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      // Verify the user is deleted.
      await request(app.getHttpServer())
        .get(`/api/users/${deleteUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
  
  describe('GPA API', () => {
    const gpaData = {
      currentGPA: 3.5,
      totalCredits: 60,
      projectedGPA: 3.7,
    };
  
    it('POST /api/gpa should create/update GPA record', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/gpa')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gpaData)
        .expect(201);
      expect(response.body.currentGPA).toBe(gpaData.currentGPA);
      expect(response.body.totalCredits).toBe(gpaData.totalCredits);
      expect(response.body.projectedGPA).toBe(gpaData.projectedGPA);
    });
  
    it('GET /api/gpa should return the GPA record', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gpa')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(response.body.currentGPA).toBe(gpaData.currentGPA);
      expect(response.body.totalCredits).toBe(gpaData.totalCredits);
      expect(response.body.projectedGPA).toBe(gpaData.projectedGPA);
    });
  
    it('GET /api/gpa/project should return projected GPA', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gpa/project')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(response.body.projectedGPA).toBe(gpaData.projectedGPA);
    });
  });
  
  describe('AI Tutor API', () => {
    it('POST /api/ai-tutor/ask should allow asking a question', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/ai-tutor/ask')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ question: 'What is NestJS?' })
        .expect(201);
      expect(response.body.response).toBeDefined();
    });
  
    it('GET /api/ai-tutor/history should return conversation history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/ai-tutor/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  
    it('POST /api/ai-tutor/feedback should submit feedback', async () => {
      // Ask a question to create a conversation record
      const askResponse = await request(app.getHttpServer())
        .post('/api/ai-tutor/ask')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ question: 'What is NestJS?' })
        .expect(201);
      const conversationId = askResponse.body._id;
      // Updated feedback payload: use "interactionId" and a boolean "feedback"
      const feedbackData = {
        interactionId: conversationId,
        feedback: true,
      };
      const response = await request(app.getHttpServer())
        .post('/api/ai-tutor/feedback')
        .set('Authorization', `Bearer ${authToken}`)
        .send(feedbackData)
        .expect(201);
      expect(response.body.message).toBeDefined();
    });
  });
  
  describe('Quiz API', () => {
    let quizId: string;
    const testQuiz = {
      title: 'Test Quiz',
      difficulty: 'Easy',
      questions: [{
        question: 'What is NestJS?',
        options: ['Framework', 'Language', 'Database', 'OS'],
        correctAnswer: 'Framework',
        explanation: 'NestJS is a Node.js framework',
        points: 10,
      }],
    };
  
    it('POST /api/quiz/generate should generate a quiz', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/quiz/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testQuiz)
        .expect(201);
      quizId = response.body._id;
      expect(response.body.title).toBe(testQuiz.title);
    });
  
    it('GET /api/quiz/:id should return quiz details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/quiz/${quizId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(response.body._id).toBe(quizId);
    });
  
    it('GET /api/quiz/user/:userId should return quizzes for the user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/quiz/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  
    // it('POST /api/quiz/:id/share should share a quiz', async () => {
    //   const shareData = { sharedWith: [userId] };
    //   const response = await request(app.getHttpServer())
    //     .post(`/api/quiz/${quizId}/share`)
    //     .set('Authorization', `Bearer ${authToken}`)
    //     .send(shareData)
    //     .expect(201);
    //   expect(response.body.message).toBeDefined();
    // });
  });
  
});
