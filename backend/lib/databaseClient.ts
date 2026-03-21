import { Pool, QueryResult, QueryResultRow } from "pg";


class Database {
    private static instance: Pool;

    private constructor() {}

    public static getInstance(): Pool {
        if (!Database.instance) {
            Database.instance = new Pool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: Number(process.env.DB_PORT) || 5432,
                max: 20,
                idleTimeoutMillis: 30000,
            });

            Database.instance.on("error", (err: any) => {
                console.error("Unexpected error on client", err);
            });
        }
        return Database.instance;
    }
}

export const query = <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
    return Database.getInstance().query<T>(text, params);
};