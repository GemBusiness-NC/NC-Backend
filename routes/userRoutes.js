import express from 'express'; 
import userAuth from '../middleware/userAuth.js'; 
import { getUserData , getAllUsers } from '../controllers/userController.js';

// Create a router instance for handling user-related routes
const userRouter = express.Router();

// Define a route to get user data
userRouter.get('/data', userAuth, getUserData);

// Get all users (authenticated)
userRouter.get('/all', userAuth, getAllUsers); // 🆕 New route



export default userRouter; 
