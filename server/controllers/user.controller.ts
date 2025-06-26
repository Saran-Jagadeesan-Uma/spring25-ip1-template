import express, { Response, Router } from 'express';
import { UserRequest, UserByUsernameRequest } from '../types/types';
import {
  deleteUserByUsername,
  getUserByUsername,
  loginUser,
  saveUser,
  updateUser,
} from '../services/user.service';

const userController = () => {
  const router: Router = express.Router();

  const isUserBodyValid = (req: UserRequest): boolean => {
    const { username, password } = req.body;
    return (
      typeof username === 'string' &&
      typeof password === 'string' &&
      username.trim().length > 0 &&
      password.trim().length > 0
    );
  };

  const createUser = async (req: UserRequest, res: Response): Promise<void> => {
    if (!isUserBodyValid(req)) {
      res.status(400).json({ error: 'Invalid user body' });
      return;
    }

    const user = { ...req.body, dateJoined: new Date() };
    const response = await saveUser(user);

    if ('error' in response) {
      if (response.error === 'Username already exists') {
        res.status(409).json(response);
      } else {
        res.status(500).json(response);
      }
    } else {
      res.status(201).json(response);
    }
  };

  const userLogin = async (req: UserRequest, res: Response): Promise<void> => {
    if (!isUserBodyValid(req)) {
      res.status(400).json({ error: 'Invalid user body' });
      return;
    }

    const response = await loginUser(req.body);

    if ('error' in response) {
      if (response.error === 'Invalid username or password') {
        res.status(401).json(response);
      } else {
        res.status(500).json(response);
      }
    } else {
      res.status(200).json(response);
    }
  };

  const getUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    const response = await getUserByUsername(req.params.username);

    if ('error' in response) {
      if (response.error === 'User not found') {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.status(500).json(response);
      }
    } else {
      res.status(200).json(response);
    }
  };

  const deleteUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    const response = await deleteUserByUsername(req.params.username);

    if ('error' in response) {
      if (response.error === 'User not found') {
        res.status(404).json(response);
      } else {
        res.status(500).json(response);
      }
    } else {
      res.status(200).json(response);
    }
  };

  const resetPassword = async (req: UserRequest, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Invalid user body' }); // changed from 'Invalid reset body'
      return;
    }

    const response = await updateUser(username, { password });

    if ('error' in response) {
      if (response.error === 'User not found') {
        res.status(404).json(response);
      } else {
        res.status(500).json(response);
      }
    } else {
      res.status(200).json(response);
    }
  };

  router.post('/register', createUser);
  router.post('/login', userLogin);
  router.get('/getUser/:username', getUser);
  router.delete('/deleteUser/:username', deleteUser);
  router.patch('/reset-password', resetPassword);

  return router;
};

export default userController;
