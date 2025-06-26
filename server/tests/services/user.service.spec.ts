import UserModel from '../../models/users.model';
import {
  deleteUserByUsername,
  getUserByUsername,
  loginUser,
  saveUser,
  updateUser,
} from '../../services/user.service';
import { SafeUser, User, UserCredentials } from '../../types/user';
import { user, safeUser } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('User model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveUser', () => {
    it('should return the saved user', async () => {
      mockingoose(UserModel).toReturn(user, 'create');
      const savedUser = (await saveUser(user)) as SafeUser;

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toEqual(user.username);
      expect(savedUser.dateJoined).toEqual(user.dateJoined);
    });

    it('should return error if save operation fails', async () => {
      jest.spyOn(UserModel, 'create').mockRejectedValueOnce(new Error('DB error'));
      const result = await saveUser(user);
      expect(result).toEqual({ error: 'Could not save user' });
    });
  });

  describe('getUserByUsername', () => {
    it('should return the matching user', async () => {
      mockingoose(UserModel).toReturn(
        {
          _id: user._id,
          username: user.username,
          password: user.password,
          dateJoined: user.dateJoined,
        },
        'findOne',
      );

      const result = await getUserByUsername(user.username);

      if ('error' in result) {
        throw new Error(`Expected a user, got error: ${result.error}`);
      }

      expect(result).toMatchObject({
        username: user.username,
        dateJoined: user.dateJoined,
      });
    });

    it('should return error if user not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');
      const result = await getUserByUsername(user.username);
      expect(result).toEqual({ error: 'User not found' });
    });

    it('should return error if retrieval fails', async () => {
      mockingoose(UserModel).toReturn(new Error('DB error'), 'findOne');
      const result = await getUserByUsername(user.username);
      expect(result).toEqual({ error: 'Failed to retrieve user' });
    });
  });

  describe('loginUser', () => {
    it('should return the user if authentication succeeds', async () => {
      mockingoose(UserModel).toReturn(
        {
          _id: user._id,
          username: user.username,
          password: user.password,
          dateJoined: user.dateJoined,
        },
        'findOne',
      );

      const credentials: UserCredentials = {
        username: user.username,
        password: user.password,
      };

      const result = await loginUser(credentials);
      expect(result).toMatchObject({
        username: user.username,
        dateJoined: user.dateJoined,
      });
    });

    it('should return error if user not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');
      const result = await loginUser({ username: user.username, password: user.password });
      expect(result).toEqual({ error: 'Invalid username or password' });
    });

    it('should return error if password is incorrect', async () => {
      mockingoose(UserModel).toReturn(
        {
          _id: user._id,
          username: user.username,
          password: 'wrongPassword',
          dateJoined: user.dateJoined,
        },
        'findOne',
      );
      const result = await loginUser({ username: user.username, password: 'differentPassword' });
      expect(result).toEqual({ error: 'Invalid username or password' });
    });

    it('should return error if login fails due to DB error', async () => {
      mockingoose(UserModel).toReturn(new Error('DB error'), 'findOne');
      const credentials: UserCredentials = {
        username: user.username,
        password: user.password,
      };
      const result = await loginUser(credentials);
      expect(result).toEqual({ error: 'Login failed' });
    });
  });

  describe('deleteUserByUsername', () => {
    it('should return the deleted user', async () => {
      mockingoose(UserModel).toReturn(
        {
          _id: user._id,
          username: user.username,
          dateJoined: user.dateJoined,
        },
        'findOneAndDelete',
      );
      const result = await deleteUserByUsername(user.username);
      expect(result).toMatchObject({
        username: user.username,
        dateJoined: user.dateJoined,
      });
    });

    it('should return error if user not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOneAndDelete');
      const result = await deleteUserByUsername(user.username);
      expect(result).toEqual({ error: 'User not found' });
    });

    it('should return error if deletion fails', async () => {
      mockingoose(UserModel).toReturn(new Error('DB error'), 'findOneAndDelete');
      const result = await deleteUserByUsername(user.username);
      expect(result).toEqual({ error: 'Failed to delete user' });
    });
  });

  describe('updateUser', () => {
    const updates: Partial<User> = { password: 'newPassword' };

    it('should return the updated user', async () => {
      mockingoose(UserModel).toReturn(
        {
          _id: user._id,
          username: user.username,
          dateJoined: user.dateJoined,
          password: updates.password,
        },
        'findOneAndUpdate',
      );

      const result = await updateUser(user.username, updates);

      expect(result).toMatchObject({
        username: user.username,
        dateJoined: user.dateJoined,
      });

      expect(result).toHaveProperty('_id');
      expect((result as any)._id).toBeDefined();
    });

    it('should return error if user not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');
      const result = await updateUser(user.username, updates);
      expect(result).toEqual({ error: 'User not found' });
    });

    it('should return error if update fails', async () => {
      mockingoose(UserModel).toReturn(new Error('DB error'), 'findOneAndUpdate');
      const result = await updateUser(user.username, updates);
      expect(result).toEqual({ error: 'Failed to update user' });
    });
  });
});
