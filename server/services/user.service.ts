import UserModel from '../models/users.model';
import { User, UserCredentials, UserResponse } from '../types/types';

/**
 * Saves a new user to the database.
 */
export const saveUser = async (user: User): Promise<UserResponse> => {
  try {
    const createdUser = await UserModel.create(user);
    const userObj = createdUser.toObject();
    delete (user as Partial<typeof user>).password;
    return userObj;
  } catch {
    return { error: 'Could not save user' };
  }
};

/**
 * Retrieves a user from the database by their username.
 */
export const getUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const user = await UserModel.findOne({ username }).select('-password').lean();
    if (!user) return { error: 'User not found' };
    return user;
  } catch {
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
    delete (user as Partial<typeof user>).password;
    return user;
  } catch {
    return { error: 'Login failed' };
  }
};

/**
 * Deletes a user from the database by their username.
 */
export const deleteUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const deletedUser = await UserModel.findOneAndDelete({ username }).select('-password').lean();
    if (!deletedUser) return { error: 'User not found' };
    return deletedUser;
  } catch {
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
    const updatedDoc = await UserModel.findOneAndUpdate({ username }, updates, {
      new: true,
    }).select('-password');

    if (!updatedDoc) return { error: 'User not found' };
    return updatedDoc.toObject();
  } catch {
    return { error: 'Failed to update user' };
  }
};
