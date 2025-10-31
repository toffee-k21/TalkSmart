import { prisma } from '@repo/db';
import { Request, Response } from 'express';

export const listUserHandler = async (req:Request, res:Response) =>{
     try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}