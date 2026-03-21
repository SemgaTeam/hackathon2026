import express from "express";
import cors from "cors";
import * as usersController from "./controllers/usersController"


const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['X-Total-Count']
}));


app.post("/api/login", (req, res) => {
    res.status(200).json({ message: "Success" });
});
app.post("/api/logout", (req, res) => {
    res.status(200).json({ message: "Logged out" });
});
app.get("/api/me", (req, res) => {
    res.json({
        id: "550e8400-e29b-41d4-a716-446655440000",
        role: "admin",
        fullName: "Admin"
    });
});

app.get("/api/users", usersController.getAllUsers);
app.get("/api/users/:id", usersController.getUserById);
app.post("/api/users", usersController.createUser);
app.put("/api/users/:id", usersController.updateUser);
app.delete("/api/users/:id", usersController.deleteUser);

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log("Server is running");
});


