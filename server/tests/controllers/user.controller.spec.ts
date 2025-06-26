import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as util from '../../services/user.service';
import { SafeUser, User } from '../../types/types';

const mockUser: User = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user1',
  password: 'password',
  dateJoined: new Date('2024-12-03'),
};

const mockSafeUser: SafeUser = {
  _id: mockUser._id,
  username: 'user1',
  dateJoined: new Date('2024-12-03'),
};

const mockUserJSONResponse = {
  _id: mockUser._id?.toString(),
  username: 'user1',
  dateJoined: new Date('2024-12-03').toISOString(),
};

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Test userController', () => {
  describe('POST /register', () => {
    let saveUserSpy: jest.SpiedFunction<typeof util.saveUser>;

    beforeEach(() => {
      saveUserSpy = jest.spyOn(util, 'saveUser');
    });

    afterEach(() => {
      saveUserSpy.mockRestore();
    });

    it('should create a new user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      saveUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).post('/user/register').send(mockReqBody);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(saveUserSpy).toHaveBeenCalledWith({ ...mockReqBody, dateJoined: expect.any(Date) });
    });

    it('should return 400 for request missing username', async () => {
      const response = await supertest(app).post('/user/register').send({ password: 'test' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });

    it('should return 400 for request missing password', async () => {
      const response = await supertest(app).post('/user/register').send({ username: 'test' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });

    it('should return 409 if username already exists', async () => {
      saveUserSpy.mockResolvedValueOnce({ error: 'Username already exists' });
      const response = await supertest(app).post('/user/register').send({
        username: mockUser.username,
        password: mockUser.password,
      });
      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'Username already exists' });
    });

    it('should return 500 if saving user fails', async () => {
      saveUserSpy.mockResolvedValueOnce({ error: 'Could not save user' });
      const response = await supertest(app).post('/user/register').send({
        username: mockUser.username,
        password: mockUser.password,
      });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Could not save user' });
    });
  });

  describe('POST /login', () => {
    let loginUserSpy: jest.SpiedFunction<typeof util.loginUser>;

    beforeEach(() => {
      loginUserSpy = jest.spyOn(util, 'loginUser');
    });

    afterEach(() => {
      loginUserSpy.mockRestore();
    });

    it('should login successfully with correct credentials', async () => {
      loginUserSpy.mockResolvedValueOnce(mockSafeUser);
      const response = await supertest(app).post('/user/login').send({
        username: mockUser.username,
        password: mockUser.password,
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
    });

    it('should return 400 if username is missing', async () => {
      const response = await supertest(app).post('/user/login').send({ password: '123' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });

    it('should return 400 if password is missing', async () => {
      const response = await supertest(app).post('/user/login').send({ username: 'test' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });

    it('should return 401 if credentials are incorrect', async () => {
      loginUserSpy.mockResolvedValueOnce({ error: 'Invalid username or password' });
      const response = await supertest(app).post('/user/login').send({
        username: 'wronguser',
        password: 'wrongpass',
      });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid username or password' });
    });

    it('should return 500 if login fails due to server error', async () => {
      loginUserSpy.mockResolvedValueOnce({ error: 'Login failed' });
      const response = await supertest(app).post('/user/login').send({
        username: mockUser.username,
        password: mockUser.password,
      });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Login failed' });
    });
  });

  describe('PATCH /reset-password', () => {
    let updateUserSpy: jest.SpiedFunction<typeof util.updateUser>;

    beforeEach(() => {
      updateUserSpy = jest.spyOn(util, 'updateUser');
    });

    afterEach(() => {
      updateUserSpy.mockRestore();
    });

    it('should return updated user given valid data', async () => {
      updateUserSpy.mockResolvedValueOnce(mockSafeUser);
      const response = await supertest(app).patch('/user/reset-password').send({
        username: mockUser.username,
        password: 'newpass',
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
    });

    it('should return 400 if username is missing', async () => {
      const response = await supertest(app)
        .patch('/user/reset-password')
        .send({ password: 'newpass' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });

    it('should return 400 if password is missing', async () => {
      const response = await supertest(app)
        .patch('/user/reset-password')
        .send({ username: 'user1' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });

    it('should return 404 if user not found', async () => {
      updateUserSpy.mockResolvedValueOnce({ error: 'User not found' });
      const response = await supertest(app).patch('/user/reset-password').send({
        username: 'nonexistent',
        password: 'pass',
      });
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should return 500 if update fails', async () => {
      updateUserSpy.mockResolvedValueOnce({ error: 'Failed to update user' });
      const response = await supertest(app).patch('/user/reset-password').send({
        username: mockUser.username,
        password: 'newpass',
      });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to update user' });
    });
  });

  describe('GET /:username', () => {
    let getUserSpy: jest.SpiedFunction<typeof util.getUserByUsername>;

    beforeEach(() => {
      getUserSpy = jest.spyOn(util, 'getUserByUsername');
    });

    afterEach(() => {
      getUserSpy.mockRestore();
    });

    it('should return user if found', async () => {
      getUserSpy.mockResolvedValueOnce(mockSafeUser);
      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
    });

    it('should return 500 if error retrieving user', async () => {
      getUserSpy.mockResolvedValueOnce({ error: 'Failed to retrieve user' });
      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to retrieve user' });
    });
  });

  describe('DELETE /:username', () => {
    let deleteUserSpy: jest.SpiedFunction<typeof util.deleteUserByUsername>;

    beforeEach(() => {
      deleteUserSpy = jest.spyOn(util, 'deleteUserByUsername');
    });

    afterEach(() => {
      deleteUserSpy.mockRestore();
    });

    it('should delete user if exists', async () => {
      deleteUserSpy.mockResolvedValueOnce(mockSafeUser);
      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
    });

    it('should return 404 if user not found', async () => {
      deleteUserSpy.mockResolvedValueOnce({ error: 'User not found' });
      const response = await supertest(app).delete('/user/deleteUser/ghost');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should return 500 if deletion fails', async () => {
      deleteUserSpy.mockResolvedValueOnce({ error: 'Failed to delete user' });
      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to delete user' });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await mongoose.disconnect();
  });
});
