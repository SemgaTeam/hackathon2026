import { UUID } from "node:crypto";
import { QueryResult, QueryResultRow } from "pg";
import "dotenv/config";

type QueryFunction = <T extends QueryResultRow = any>(
    text: string, 
    params?: any[]
) => Promise<QueryResult<T>>;

export interface User {
    id: UUID;
    username: string;
    fullname: string;
    role: string;
    password?: string;
    isDeleted: boolean;
    createdAt: Date;
}

export interface UserRepository {
    getAll(): Promise<User[]>;
    getById(id: UUID): Promise<User>;
    create(user: User): Promise<void>;
    update(user: User): Promise<void>;
    deleteById(id: UUID): Promise<void>;

    getByUsername(username: string): Promise<User | null>;
    exists(username: string): Promise<boolean>;

    saveSession(sid: string, data: any): Promise<void>;
    checkSession(sid: string): Promise<boolean>;
    deleteSession(sid: string): Promise<void>;
}

export class ConcreteUserRepository implements UserRepository {
    private readonly query: QueryFunction;

    constructor(query: QueryFunction) {
        this.query = query;
    }

    async getByUsername(username: string): Promise<User | null> {
        const { rows } = await this.query<User>(
            `SELECT 
                id, 
                role, 
                username, 
                fullname, 
                password,
                is_deleted AS "isDeleted", 
                created_at AS "createdAt" 
            FROM users 
            WHERE username = $1 AND is_deleted = false`,
            [username]
        );
        return rows[0] || null;
    }

    async exists(username: string): Promise<boolean> {
        const { rows } = await this.query(
            "SELECT 1 FROM users WHERE username = $1 LIMIT 1",
            [username]
        );
        return rows.length > 0;
    }

    async getById(id: UUID): Promise<User> {
        const { rows } = await this.query<User>(
            `SELECT 
                id, 
                role, 
                username, 
                fullname, 
                is_deleted AS "isDeleted", 
                created_at AS "createdAt" 
            FROM users 
            WHERE id = $1`,
            [id]
        );
        if (rows.length === 0) throw new Error("User not found");
        return rows[0];
    }

    async getAll(): Promise<User[]> {
        try {
            const { rows } = await this.query<User>(
                `SELECT 
                    id, 
                    role, 
                    username, 
                    fullname, 
                    is_deleted AS "isDeleted", 
                    created_at AS "createdAt" 
                FROM users 
                WHERE is_deleted = false
                ORDER BY created_at DESC` // Сортируем по умолчанию
            );
            return rows;
        } catch (error) {
            console.error("DATABASE_ERROR_GET_ALL:", error);
            throw error;
        }
    }

    async create(user: User): Promise<void> {
        const sql = `
            INSERT INTO users (id, role, password, username, fullname, is_deleted, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await this.query(sql, [
            user.id, 
            user.role, 
            user.password, 
            user.username, 
            user.fullname, 
            user.isDeleted, 
            user.createdAt
        ]);
    }

    async update(user: User): Promise<void> {
        const sql = `
            UPDATE users 
            SET role = $2, fullname = $3, is_deleted = $4 
            WHERE id = $1
        `;
        const { rowCount } = await this.query(sql, [
            user.id, user.role, user.fullname, user.isDeleted
        ]);
        if (rowCount === 0) throw new Error("Update failed: User not found");
    }

    async deleteById(id: UUID): Promise<void> {
        console.log("Delete user by id started for: ", id);
        const sql = `UPDATE users SET is_deleted = true WHERE id = $1`;
        const { rowCount } = await this.query(sql, [id]);
        if (rowCount === 0) throw new Error("Delete failed: User not found");
        console.log("delete user by id (soft delete completed");
    }

    async saveSession(sid: string, data: any): Promise<void> {
        const sql = `
            INSERT INTO "session" (sid, sess, expire) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (sid) DO UPDATE SET sess = $2, expire = $3
        `;
        const expireDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 часа
        await this.query(sql, [sid, JSON.stringify(data), expireDate]);
    }

    async checkSession(sid: string): Promise<boolean> {
        const { rows } = await this.query(
            'SELECT 1 FROM "session" WHERE sid = $1 AND expire > NOW()', 
            [sid]
        );
        return rows.length > 0;
    }

    async deleteSession(sid: string): Promise<void> {
        await this.query('DELETE FROM "session" WHERE sid = $1', [sid]);
    }
}