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
import { PlaybackRepository } from "./repository/playback";
import { StorageRepository } from "./repository/storage";
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { MediaController } from "./controllers/mediaController";

const app = express();
const PORT = process.env.PORT || 8081;
const RTPMAddress = process.env.RTPMAddress || "http://localhost:1935/hsl/index.m3u8";

const userRepository = new ConcreteUserRepository(query);
const userController = new UserController(userRepository);
const authController = new AuthController(userRepository);

const queueRepository = new InMemoryQueueRepository();
const playlistRepository = new PlaylistRepository(query);
const playbackRepository = new PlaybackRepository(RTPMAddress);
const s3 = new S3Client({
  endpoint: process.env.S3Addr || "http://localhost:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3AccessKeyId || "",
    secretAccessKey: process.env.S3SecretAccessKey || "",
  },
  forcePathStyle: true,
});
const storageRepository = new StorageRepository(s3, query);

const service = new Service(queueRepository, playlistRepository);
const mediaController = new MediaController(service, storageRepository, playbackRepository);

const upload = multer({
  storage: multer.diskStorage({
    destination: "/tmp",
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${randomUUID()}${ext}`);
    }
  })
});

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
      sameSite: "lax",
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

app.post("/api/audio", checkAuth, upload.single("file"), mediaController.uploadAudio);
app.delete("/api/audio/:id", checkAuth, mediaController.deleteAudio);
app.post("/api/audio/:id/play", checkAuth, mediaController.playAudio);

app.post("/api/playlists", checkAuth, mediaController.createPlaylist);
app.post("/api/playlists/:id/run", checkAuth, mediaController.runPlaylist);
app.post("/api/playlists/:id/items", checkAuth, mediaController.addItemToPlaylist);
app.patch("/api/playlists/:id/items/move", checkAuth, mediaController.moveItemBefore);
app.delete("/api/playlists/:id/items/:itemId", checkAuth, mediaController.removeFromPlaylist);

app.post("/api/queue/toggle-loop", checkAuth, mediaController.toggleLoop);
app.post("/api/queue/toggle-playback", checkAuth, mediaController.togglePlayback);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
