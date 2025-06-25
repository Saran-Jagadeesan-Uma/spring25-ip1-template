import UserModel from '../models/users.model';
import { User, UserCredentials, UserResponse, SafeUser } from '../types/types';

/**
 * Saves a new user to the database.
 */
export const saveUser = async (user: User): Promise<UserResponse> => {
  try {
    const createdUser = await UserModel.create(user);
    const { password: _password, ...safeUser } = createdUser.toObject();
    return safeUser as SafeUser;
  } catch (error) {
    return { error: 'Could not save user' };
  }
};

/**
 * Retrieves a user from the database by their username.
 */
export const getUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const user = await UserModel.findOne({ username }).lean();
    if (!user) return { error: 'User not found' };
    const { password, ...safeUser } = user;
    return safeUser as SafeUser;
  } catch (error) {
    return { error: 'Failed to retrieve user' };
  }
};

/**
 * Authenticates a user by verifying their username and password.
 */
export const loginUser = async (loginCredentials: UserCredentials): Promise<UserResponse> => {
  try {
    const user = await UserModel.findOne({ username: loginCredentials.username }).lean();
    if (!user || user.password !== loginCredentials.password) {
      return { error: 'Invalid username or password' };
    }
    const { password, ...safeUser } = user;
    return safeUser as SafeUser;
  } catch (error) {
    return { error: 'Login failed' };
  }
};

/**
 * Deletes a user from the database by their username.
 */
export const deleteUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const deletedUser = await UserModel.findOneAndDelete({ username }).lean();
    if (!deletedUser) return { error: 'User not found' };
    const { password, ...safeUser } = deletedUser;
    return safeUser as SafeUser;
  } catch (error) {
    return { error: 'Failed to delete user' };
  }
};

/**
 * Updates user information in the database.
 */
export const updateUser = async (
  username: string,
  updates: Partial<User>,
): Promise<UserResponse> => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate({ username }, updates, {
      new: true,
      lean: true,
    });
    if (!updatedUser) return { error: 'User not found' };
    const { password, ...safeUser } = updatedUser;
    return safeUser as SafeUser;
  } catch (error) {
    return { error: 'Failed to update user' };
  }
};
