import { User, UserRepository } from './../repository/users';
import { Request, Response } from 'express';
import { UUID, randomUUID } from "node:crypto";
import { hashedPassword } from '../server/bcrypt';

export class UserController {
    private readonly userRepository: UserRepository;
    
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public getAllUsers = async (req: Request, res: Response) => {
        try {
            const users = await this.userRepository.getAll();
            
            res.setHeader('X-Total-Count', users.length.toString()); 
            res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
            res.json(users);
        } catch (error: any) {
            console.error("!!! DETAILED ERROR !!!");
            console.error("Message:", error.message);
            console.error("Code:", error.code);
            console.error("Stack:", error.stack);
            res.status(500).json({ error: "Internal Server Error", details: error.message });            
        }
    }

    public getUserById = async (req: Request, res: Response) => {
        try {
            const user = await this.userRepository.getById(req.params.id as UUID);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: "Not Found" });
        }
    }

    public createUser = async (req: Request, res: Response) => {
        try {
            const newUser: User = {
                id: randomUUID(),
                username: req.body.username,
                fullname: req.body.fullname,
                role: req.body.role || "user",
                password: await hashedPassword(req.body.password),
                isDeleted: false,
                createdAt: new Date()
            };
            await this.userRepository.create(newUser);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(400).json({ error: "Bad Request" });
        }
    }

    public updateUser = async (req: Request, res: Response) => {
        try {
            const user = {
                id: req.params.id as UUID,
                ...req.body
            };
            await this.userRepository.update(user);
            res.json(user);
        } catch (error) {
            res.status(400).json({ error: "Update Failed" });
        }   
    }

    public deleteUser = async (req: Request, res: Response) => {
        try {
            await this.userRepository.deleteById(req.params.id as UUID);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: "Delete Failed" });
        }
    }
}