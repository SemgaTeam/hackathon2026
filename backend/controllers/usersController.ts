import { User, UserRepository } from './../repository/users';
import { Request, Response } from 'express';
import { UUID, randomUUID } from "node:crypto";


export class UserController {
    private readonly userRepository: UserRepository;
    
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public async getAllUsers(req:Request, res: Response) {
        try {
            const users = await this.userRepository.getAll();
            res.setHeader('X-Total-Count', users.length.toString()); 
            res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    public async getUserById(req: Request, res: Response) {
        try {
            const user = await this.userRepository.getById(req.params.id as UUID);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: "Not Found" });
        }
    }

    public async createUser(req: Request, res: Response) {
        try {
            const newUser: User = {
                id: randomUUID(),
                username: req.body.username,
                fullname: req.body.fullname,
                role: 'user',
                password: req.body.password,
                isDeleted: false,
                createdAt: new Date()
            };
            await this.userRepository.create(newUser);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(400).json({ error: "Bad Request" });
        }
    }

    public async  updateUser(req: Request, res: Response) {
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

    public async deleteUser(req: Request, res: Response) {
        try {
            await this.userRepository.deleteById(req.params.id as UUID);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: "Delete Failed" });
        }
    }
}
