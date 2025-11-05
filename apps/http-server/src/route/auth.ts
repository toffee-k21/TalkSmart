import express, { Router } from 'express';
import { signinHandler, signupHandler, VerifyToken } from '../controllers/auth';

const authRouter: Router = express.Router();

authRouter.post('/signup', signupHandler);
authRouter.post('/signin', signinHandler);
authRouter.get("/verifyToken", VerifyToken);

export default authRouter;