import express from "express";
import session from "express-session";
import cors from "cors";
import "dotenv/config";

import { query } from './lib/databaseClient';
import { ConcreteUserRepository } from './repository/users';
import { UserController } from './controllers/usersController';
import { AuthController } from './controllers/authController';
import { checkAuth, checkRole } from "./middleware/authMiddleware";
import { InMemoryQueueRepository } from "./repository/queue";
import { PlaylistRepository } from "./repository/playlists";
import { Service } from "./service/service";

const app = express();
const PORT = process.env.PORT || 8081;

const userRepository = new ConcreteUserRepository(query);
const userController = new UserController(userRepository);
const authController = new AuthController(userRepository);

const queueRepository = new InMemoryQueueRepository();
const playlistRepository = new PlaylistRepository(query);
const service = new Service(queueRepository, playlistRepository);

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['X-Total-Count']
}));

app.use(session({
    name: "connect.sid",
    secret: process.env.SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: parseInt(process.env.SESSION_AT || "86400000"),
    },
}));

declare module "express-session" {
  interface SessionData {
    user?: { 
      id: string; 
      role: string;
    };
  }
}

app.post("/api/register", authController.register);
app.post("/api/login", authController.login);
app.get("/api/me", checkAuth, authController.me);
app.post("/api/logout", authController.logout);

app.get("/api/users", checkAuth, checkRole('admin'), userController.getAllUsers);
app.get("/api/users/:id", checkAuth, userController.getUserById);
app.post("/api/users", checkAuth, checkRole('admin'), userController.createUser);
app.put("/api/users/:id", checkAuth, checkRole('admin'), userController.updateUser);
app.delete("/api/users/:id", checkAuth, checkRole('admin'), userController.deleteUser);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});