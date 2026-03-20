const express = require("express");
const session = require("express-session");
const { Client } = require("pg");
const cookieParser = require("cookie-parser");

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

const createCookie = async (req, res) => {
    const sid = req.
    const query = "INSERT INTO sessions (sid) VALEUS ($1) RETURNING *"
    const values = []
}

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
