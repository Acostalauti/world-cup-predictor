import createClient, { Middleware } from "openapi-fetch";
import type { paths } from "../types/api";

const authMiddleware: Middleware = {
    async onRequest({ request }) {
        const token = localStorage.getItem("token");
        if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
        }
        return request;
    },
};

export const client = createClient<paths>({
    baseUrl: "http://localhost:8000",
});

client.use(authMiddleware);
