const express = require("express");
const session = require("express-session");
const { Client } = require("pg");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

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
      secure: true,
      sameSite: "strict",
      maxAge: process.env.SESSION_AT,
    },
  }),
);
const hashedPassword = async (password) => {
  const saltRounds = 10;
  const hashPassword = await bcrypt.hash(password, saltRounds);
  return hashPassword;
};

app.post("/registr", async (req, res) => {
  const { name, password } = req.body;
  const pass = hashedPassword(password);
  const query =
    "INSERT INTO users (name, password) VALUES = ($1, $2) RETURNING *";
  const values = [name, pass];
  const result = await Client.query(query, values);
  res.session.user = { id: result[0], name: result[1] };
  res.status(201).send("User registr!");
});
app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  const query = "SELECT";
});

const createCookie = async (req, res) => {
  const sid = req.session.sid;
  console.log;
  const query = "INSERT INTO sessions (sid) VALEUS ($1) RETURNING *";
  const values = [];
};

const sessionStore = {
  async get(req) {
    const { sid } = req.body;
    const query = "SELECT * FROM sessions WHERE sid =$1";
    const values = [sid];
    const result = await Client.query(query, values);
    return result;
  },
  async set(req) {
    const { sid } = req.body;
    const query = "INSERT INTO sessions (sid) VALUES = $1";
  },
};
