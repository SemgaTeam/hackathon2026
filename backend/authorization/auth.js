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
    name: "connect.sid",
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
    const { name, password } = req.body;
    const pass = hashedPassword(password);
    const query =
      "INSERT INTO users (name, password) VALUES = ($1, $2) RETURNING *";
    const values = [name, pass];
    const result = await Client.query(query, values);
    const User = result.rows[0];
    res.session.user = { id: User.id, name: User.name };
    res.status(201).send("User registr!");
  } catch (error) {
    res.status(401).json({ error });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const query = "SELECT * FROM users WHERE name = $1";
    const values = [name];
    const result = await Client.query(query, values);
    const User = result.rows[0];
    const isValid = await bcrypt.compare(password, User.password);
    if (!isValid) {
      res.status(401).send("Неверный пароль");
    }
    res.session.user = { id: User.id, name: User.name };
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
app.listen(8000, console.log("http://localhost:8000"));
