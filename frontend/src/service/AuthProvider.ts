import type { AuthProvider } from "react-admin";

const apiUrl = import.meta.env.VITE_JSON_SERVER_URL;

export const authProvider: AuthProvider = {
    login: async ({username, password}) => {
        const resp = await fetch(`${apiUrl}/login`, {
            method: "POST",
            body: JSON.stringify({username, password}),
            headers: new Headers({ "Content-Type": "application/json"}),
            credentials: "include"
        });

        if (!resp.ok) {
            throw new Error("Invalid request");
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
        const status  = error.status;
        if (status == 401 || status == 403) {
            return Promise.reject();
        }
        return Promise.resolve();
    },

    getIdentity: async () => {
        const resp = await fetch(`${apiUrl}/me`, {
            credentials: "include"
        });

        const data = await resp.json();

        return {
            id: data.id,
            name: data.name
        };
    },

    getPermissions: async () => {
        const resp = await fetch(`${apiUrl}/me`, {
            credentials: "include"
        });

        if (!resp.ok) {
            Promise.reject();
        }

        const { role } = await resp.json();

        return Promise.resolve(role);
    }
};