import { User } from '@repo/db';
import { Request, Response } from 'express';
import { JWT_SECRET } from "@repo/common-backend/config"
import jwt from "jsonwebtoken";

export const signinHandler = async (req:Request, res:Response) => {
    let user;

    user = await User.findOne(
        {
            email: req.body.email,
            password: req.body.password,
        }
    );
    if(!user){
        res.json({ error: 'user does not exists' });
        return;
    }

    const id = user._id;

    const token = jwt.sign({id}, JWT_SECRET);
    res.json(token);
}

export const signupHandler = async (req:Request, res:Response) => {
    let user;
    try {
        user = await User.insertOne({
            username: req.body.username,
            email: req.body.username,
            password: req.body.password
        });
    } catch (e) {
        res.json({ error: 'user already exists', e });
        return;
    }
    const id = user._id;

    const token = jwt.sign({id}, JWT_SECRET);
    res.json(token);
}

export const VerifyToken = (req: Request, res:Response) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ valid: false });

  try {
    console.log("token");
    jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true });
  } catch {
    return res.status(401).json({ valid: false });
  }
};