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

// const loginUserSpy = jest.spyOn(util, 'loginUser');
// const updatedUserSpy = jest.spyOn(util, 'updateUser');
// const getUserByUsernameSpy = jest.spyOn(util, 'getUserByUsername');
// const deleteUserByUsernameSpy = jest.spyOn(util, 'deleteUserByUsername');

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
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/register').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });

    it('should return 409 if username already exists', async () => {
      saveUserSpy.mockResolvedValueOnce({ error: 'Username already exists' });
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };
      const response = await supertest(app).post('/user/register').send(mockReqBody);
      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'Username already exists' });
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };
      const response = await supertest(app).post('/user/register').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });

    // TODO: Task 1 - Write additional test cases for signupRoute
  });

  describe('POST /login', () => {
    let loginUserSpy: jest.SpiedFunction<typeof util.loginUser>;

    beforeEach(() => {
      loginUserSpy = jest.spyOn(util, 'loginUser');
    });

    afterEach(() => {
      loginUserSpy.mockRestore();
    });
    it('should succesfully login for a user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(loginUserSpy).toHaveBeenCalledWith(mockReqBody);
    });

    it('should return 401 for incorrect password', async () => {
      loginUserSpy.mockResolvedValueOnce({ error: 'Invalid username or password' });
      const mockReqBody = {
        username: mockUser.username,
        password: 'wrongPassword',
      };
      const response = await supertest(app).post('/user/login').send(mockReqBody);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid username or password' });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };
      const response = await supertest(app).post('/user/login').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });

    // TODO: Task 1 - Write additional test cases for loginRoute
  });

  describe('PATCH /reset-password', () => {
    let updatedUserSpy: jest.SpiedFunction<typeof util.updateUser>;

    beforeEach(() => {
      updatedUserSpy = jest.spyOn(util, 'updateUser');
    });

    afterEach(() => {
      updatedUserSpy.mockRestore();
    });
    it('should succesfully return updated user object given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/reset-password').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockUserJSONResponse });
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, { password: 'newPassword' });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/user/reset-password').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });

    it('should return 404 if user does not exist', async () => {
      updatedUserSpy.mockResolvedValueOnce({ error: 'User not found' });
      const mockReqBody = {
        username: 'nonexistentuser',
        password: 'newPassword',
      };
      const response = await supertest(app).patch('/user/reset-password').send(mockReqBody);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };
      const response = await supertest(app).patch('/user/reset-password').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user body' });
    });
    // TODO: Task 1 - Write additional test cases for resetPasswordRoute
  });

  describe('GET /:username', () => {
    let getUserByUsernameSpy: jest.SpiedFunction<typeof util.getUserByUsername>;

    beforeEach(() => {
      getUserByUsernameSpy = jest.spyOn(util, 'getUserByUsername');
    });

    afterEach(() => {
      getUserByUsernameSpy.mockRestore();
    });
    it('should return the user given correct arguments', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).get(`/user/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 404 if user does not exist', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'User not found' });
      const response = await supertest(app).get(`/user/nonexistentuser`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    // TODO: Task 1 - Write additional test cases for getUserRoute
  });

  describe('DELETE /:username', () => {
    let deleteUserByUsernameSpy: jest.SpiedFunction<typeof util.deleteUserByUsername>;

    beforeEach(() => {
      deleteUserByUsernameSpy = jest.spyOn(util, 'deleteUserByUsername');
    });

    afterEach(() => {
      deleteUserByUsernameSpy.mockRestore();
    });

    it('should return the deleted user given correct arguments', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).delete(`/user/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(deleteUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    // it('should return 404 if username not provided', async () => {
    //   // Express automatically returns 404 for missing parameters when
    //   // defined as required in the route
    //   const response = await supertest(app).delete('/user/deleteUser/');
    //   expect(response.status).toBe(404);
    // });

    // it('should return 404 if user does not exist', async () => {
    //   deleteUserByUsernameSpy.mockResolvedValueOnce({ error: 'User not found' });
    //   const response = await supertest(app).delete(`/user/nonexistentuser`);
    //   expect(response.status).toBe(404);
    //   expect(response.body).toEqual({ error: 'User not found' });
    // });
    // TODO: Task 1 - Write additional test cases for deleteUserRoute
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