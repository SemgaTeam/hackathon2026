import type { AuthProvider } from "react-admin";

const apiUrl = import.meta.env.VITE_JSON_SERVER_URL;

export interface CustomAuthProvider extends AuthProvider {
    register: (params: any) => Promise<void>;
}

export const authProvider: CustomAuthProvider = {
    login: async ({username, password}) => {
        const resp = await fetch(`${apiUrl}/login`, {
            method: "POST",
            body: JSON.stringify({username, password}),
            headers: new Headers({ "Content-Type": "application/json"}),
            credentials: "include"
        });

        if (!resp.ok) {
            const error = await resp.json().catch(() => ({}));
            throw new Error(error.error || "Ошибка авторизации");
        }
        return Promise.resolve();
    },

    register: async ({ username, fullname, password }) => {
        const resp = await fetch(`${apiUrl}/register`, {
            method: "POST",
            body: JSON.stringify({ username, fullname, password }),
            headers: new Headers({ "Content-Type": "application/json" }),
            credentials: "include"
        });

        if (!resp.ok) {
            const error = await resp.json().catch(() => ({}));
            throw new Error(error.error || "Ошибка при регистрации");
        }
        return Promise.resolve();
    },

    logout: async () => {
        await fetch(`${apiUrl}/logout`, {
            method: "POST",
            credentials: "include"
        });
        return Promise.resolve();
    },

    checkAuth: async () => {
        const resp = await fetch(`${apiUrl}/me`, {
            method: "GET",
            credentials: "include"
        });
        return resp.ok ? Promise.resolve() : Promise.reject();
    },

    checkError: (error) => {
        const status = error.status;
        if (status == 401 || status == 403) {
            return Promise.reject();
        }
        return Promise.resolve();
    },

    getIdentity: async () => {
        try {
            const resp = await fetch(`${apiUrl}/me`, {
                credentials: "include"
            });
            if (!resp.ok) return { id: '', fullName: '' };
            const data = await resp.json();
            return {
                id: data.id,
                fullName: data.fullname || data.username,
                avatar: data.avatar 
            };
        } catch (e) {
            return { id: '', fullName: '' };
        }
    },

    getPermissions: async () => {
        const resp = await fetch(`${apiUrl}/me`, {
            credentials: "include"
        });
        if (!resp.ok) return Promise.reject();
        const { role } = await resp.json();
        return Promise.resolve(role);
    }
};