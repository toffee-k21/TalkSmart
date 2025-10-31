import express, { Request, Response } from "express";
import userRouter from "./route/auth";
import cors from 'cors';
import { listUserHandler } from "./controllers/users";

const app = express();
const PORT = 5000;

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use("/auth", userRouter);
app.use("/users", listUserHandler); // add middleware
app.get("/", (req: Request, res: Response) => {
  res.send("Hello TypeScript + Express 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
