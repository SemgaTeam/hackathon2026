const express = require("express");
const session = require("express-session");
const { Client } = require("pg");

const app = express();

app.use(express.json());

store = {
  async get(sid) {
    const query = "SELECT * FROM sessions WHERE sid = $1;";
    const values = [sid];
    const res = await Client.query(query, values);
    return res;
  },
  set(sid, session) {},
};

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
  }),
);
