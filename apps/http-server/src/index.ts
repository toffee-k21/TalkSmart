import express, { Request, Response } from "express";
import cors from 'cors';
import { listUserHandler } from "./controllers/users";
import authRouter from "./route/auth";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 5000;

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/auth", authRouter);
app.use("/users", listUserHandler); // add middleware
app.get("/", (req: Request, res: Response) => {
  res.send("Hello TypeScript + Express 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
