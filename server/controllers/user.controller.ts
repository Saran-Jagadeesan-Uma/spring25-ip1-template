import express, { Response, Router } from 'express';
import {
  UserRequest,
  UserByUsernameRequest,
} from '../types/types';
import {
  deleteUserByUsername,
  getUserByUsername,
  loginUser,
  saveUser,
  updateUser,
} from '../services/user.service';

const userController = () => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for a user.
   */
  const isUserBodyValid = (req: UserRequest): boolean => {
    const { username, password } = req.body;
    return typeof username === 'string' && typeof password === 'string' &&
      username.trim().length > 0 && password.trim().length > 0;
  };

  /**
   * Handles the creation of a new user account.
   */
  const createUser = async (req: UserRequest, res: Response): Promise<void> => {
    if (!isUserBodyValid(req)) {
      res.status(400).json({ error: 'Invalid user body' });
      return;
    }

    const user = {
      ...req.body,
      dateJoined: new Date(),
    };

    const response = await saveUser(user);
    if ('error' in response) {
      res.status(400).json(response);
    } else {
      res.status(201).json(response);
    }
  };

  /**
   * Handles user login by validating credentials.
   */
  const userLogin = async (req: UserRequest, res: Response): Promise<void> => {
    if (!isUserBodyValid(req)) {
      res.status(400).json({ error: 'Invalid login credentials' });
      return;
    }

    const response = await loginUser(req.body);
    if ('error' in response) {
      res.status(401).json(response);
    } else {
      res.status(200).json(response);
    }
  };

  /**
   * Retrieves a user by their username.
   */
  const getUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    const response = await getUserByUsername(req.params.username);
    if ('error' in response) {
      res.status(404).json(response);
    } else {
      res.status(200).json(response);
    }
  };

  /**
   * Deletes a user by their username.
   */
  const deleteUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    const response = await deleteUserByUsername(req.params.username);
    if ('error' in response) {
      res.status(404).json(response);
    } else {
      res.status(200).json(response);
    }
  };

  /**
   * Resets a user's password.
   */
  const resetPassword = async (req: UserRequest, res: Response): Promise<void> => {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Invalid reset body' });
      return;
    }

    const response = await updateUser(username, { password });
    if ('error' in response) {
      res.status(404).json(response);
    } else {
      res.status(200).json(response);
    }
  };

  // Register routes with appropriate HTTP methods and paths
  router.post('/', createUser);
  router.post('/login', userLogin);
  router.get('/:username', getUser);
  router.delete('/:username', deleteUser);
  router.patch('/reset', resetPassword);

  return router;
};

export default userController;
