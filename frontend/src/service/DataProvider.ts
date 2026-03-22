import jsonServerProvider from "ra-data-json-server";
import { fetchUtils } from "react-admin";

const apiUrl = import.meta.env.VITE_JSON_SERVER_URL;

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    options.credentials = 'include'; 
    return fetchUtils.fetchJson(url, options);
};

export const dataProvider = jsonServerProvider(
    apiUrl,
    httpClient
);
