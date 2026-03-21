const express = require("express");
const session = require("express-session");
const { Client } = require("pg");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
require("dotenv").config();

const app = express();

app.use(express.json());
//app.use(cookieParser(process.env.SECRET));
app.use(
  session({
    username: "connect.sid",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: +process.env.SESSION_AT,
    },
  }),
);
const hashedPassword = async (password) => {
  const saltRounds = 10;
  const hashPassword = await bcrypt.hash(password, saltRounds);
  return hashPassword;
};

app.post("/registr", async (req, res) => {
  try {
    const { username, password } = req.body;
    const { sid } = res.session.sid;
    const pass = hashedPassword(password);
    const query =
      "WITH new_user AS(INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *) INSERT INTO session (sid) VALUES ($3) RETURNING *";
    const values = [username, pass, sid];
    const result = await Client.query(query, values);
    const User = result.rows[0];
    res.session.user = { id: User.id, username: User.username };
    res.status(201).send("User registr!");
  } catch (error) {
    res.status(401).json({ error });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = $1";
    const values = [username];
    const result = await Client.query(query, values);
    const User = result.rows[0];
    const isValid = await bcrypt.compare(password, User.password);
    if (!isValid) {
      res.status(401).send("Неверный пароль");
    }
    res.session.user = { id: User.id, username: User.username };
    res.status(201).send("Вы авторизовались");
  } catch (error) {
    res.status(401).json({ error });
  }
});
app.get("/authme", async (req, res) => {
  try {
    const query = "SELECT * FROM sessions WHERE sid = $1";
    const values = [req.session.sid];
    result = await Client.query(query, values);
    const { sid } = req.session.sid;
    if (result.rows[0] == sid) {
      res.status(200).send("Авторизован");
    }
  } catch (error) {
    res.status(401).send("Не авторизован");
  }
});
app.post("/logout", async (req, res) => {
  res.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json("Вы вышли из аккаунта");
  });
});
app.listen(8000, console.log("http://localhost:8000"));
