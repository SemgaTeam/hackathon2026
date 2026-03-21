import express, { Request, Response } from "express";
import session from "express-session";
import { hashedPassword } from "./bcrypt";
import "dotenv/config";
import bcrypt from "bcrypt";

const app = express();

app.use(express.json());

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SECRET as string,
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: parseInt(process.env.SESSION_AT as string),
    },
  }),
);

declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
    };
  }
}

export const insertSession = async (sid: string) => {
  const querySession = `INSERT INTO session (sid)
    SELECT $1
    RETURNING *;`;
  const valuseSession = [sid];
  const resultSession = await client.query(querySession, valuseSession);
  return resultSession;
};

app.post("/registr", async (req: Request, res: Response) => {
  try {
    const { username, password, fullname, role } = req.body;
    const sid = req.sessionID;
    console.log(sid);
    const pass = await hashedPassword(password);
    const query = `
  INSERT INTO users (username, password, fullname, role)
  VALUES ($1, $2, $3)
  RETURNING *;`;
    const values = [username, pass, fullname, role];
    const result = await client.query(query, values);
    await insertSession(sid);
    const User = result.rows[0];
    req.session.user = { id: User.id };
    res.status(201).send("User registr!");
  } catch (error) {
    res
      .status(401)
      .json(error as Error)
      .toString();
  }
});
app.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = $1;";
    const values = [username];
    const result = await client.query(query, values);
    const User = result.rows[0];
    const isValid = await bcrypt.compare(password, User.password);
    if (!isValid) {
      res.status(401).send("Неверный пароль");
    }
    req.session.user = { id: User.id };
    const sid = req.sessionID;
    await insertSession(sid);
    res.status(201).send("Вы авторизовались");
  } catch (error) {
    res
      .status(401)
      .json(error as Error)
      .toString();
  }
});
app.post("/authme", async (req: Request, res: Response) => {
  try {
    const query = "SELECT * FROM sessions WHERE sid = $1;";
    const sid = req.sessionID;
    const values = [sid];
    const result = await client.query(query, values);
    if (result.rows[0] > 0) {
      res.status(200).send("Авторизован");
    }
  } catch (error) {
    res.status(401).send("Не авторизован");
  }
});
app.get("/logout", async (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(200).json("Вы вышли из аккаунта");
  });
});
app.listen(8000);
