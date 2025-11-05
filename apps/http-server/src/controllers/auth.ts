import { prisma } from '@repo/db';
import { Request, Response } from 'express';
import { JWT_SECRET } from "@repo/common-backend/config"
import jwt from "jsonwebtoken";

export const signinHandler = async (req:Request, res:Response) => {
    let user;
    try {
        user = await prisma.user.findFirst({
            where: {
                email: req.body.email,
                password: req.body.password,
            },
        });
    } catch (e) {
        res.json({ error: 'user does not exists', e });
        return;
    }
    const id = user.id;

    const token = jwt.sign(id, JWT_SECRET);
    res.json(token);
}

export const signupHandler = async (req:Request, res:Response) => {
    let user;
    try {
        user = await prisma.user.create({
            data: req.body,
        });
    } catch (e) {
        res.json({ error: 'user already exists', e });
        return;
    }
    const id = user.id;

    const token = jwt.sign(id, JWT_SECRET);
    res.json(token);
}