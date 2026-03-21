import { query } from './../lib/databaseClient';
import { Request, Response } from 'express';
import { ConcreteUserRepository } from '../repository/users';
import { UUID, randomUUID } from "node:crypto";


const userRepo = new ConcreteUserRepository(query);

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userRepo.getAll();
        res.setHeader('X-Total-Count', users.length.toString()); 
        res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await userRepo.getById(req.params.id as UUID);
        res.json(user);
    } catch (error) {
        res.status(404).json({ error: "Not Found" });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const newUser = {
            id: randomUUID(),
            role: req.body.role || 'user',
            password: req.body.password,
            isDeleted: false,
            createdAt: new Date()
        };
        await userRepo.create(newUser);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: "Bad Request" });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const user = {
            id: req.params.id as UUID,
            ...req.body
        };
        await userRepo.update(user);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: "Update Failed" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        await userRepo.deleteById(req.params.id as UUID);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: "Delete Failed" });
    }
};