import express, { Request, Response } from "express";
import userRouter from "./route/auth";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use("/auth", userRouter);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello TypeScript + Express 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
