import { UUID } from "node:crypto"
import { QueryResult, QueryResultRow } from "pg";

type QueryFunction = <T extends QueryResultRow = any>(
    text: string, 
    params?: any[]
) => Promise<QueryResult<T>>;

export interface User {
    id: UUID;
    role: string;
    password: string;
    isDeleted: boolean;
    createdAt: Date;
}

export interface UserRepository {
    getAll(): Promise<User[]>;
    getById(id: UUID): Promise<User>;
    create(user: User): Promise<void>;
    update(user: User): Promise<void>;
    deleteById(id: UUID): Promise<void>;
}

export class ConcreteUserRepository {
    private readonly query: QueryFunction;

    constructor(query: QueryFunction) {
        this.query = query;
    }

    async getById(id: UUID): Promise<User> {
        const { rows } = await this.query<User>(
            "SELECT * FROM users WHERE id = $1",
            [id]
        );

        if (rows.length === 0) {
            throw new Error("User not found");
        }

        return rows[0];
    }

    async getAll(): Promise<User[]> {
        const { rows } = await this.query<User>(
            "SELECT * FROM users"
        );

        if (rows.length === 0)
            throw Error("There is not users at all!");

        return rows;
    }

async create(user: User): Promise<void> {
        const sql = `
            INSERT INTO users (id, role, password, is_deleted, create_ad)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await this.query(sql, [
            user.id, 
            user.role, 
            user.password, 
            user.isDeleted, 
            user.createdAt
        ]);
    }

    async update(user: User): Promise<void> {
        const sql = `
            UPDATE users 
            SET role = $2, password = $3, is_deleted = $4 
            WHERE id = $1
        `;
        const { rowCount } = await this.query(sql, [
            user.id, 
            user.role, 
            user.password, 
            user.isDeleted
        ]);

        if (rowCount === 0) {
            throw new Error("Update failed: User not found");
        }
    }

    async deleteById(id: UUID): Promise<void> {
        const sql = `UPDATE users SET is_deleted = true WHERE id = $1`;
        const { rowCount } = await this.query(sql, [id]);

        if (rowCount === 0) {
            throw new Error("Delete failed: User not found");
        }
    }
}