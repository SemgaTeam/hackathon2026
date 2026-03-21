export interface User {
  id: string;
  username: string;
  fullname: string;
  role: "user" | "host" | "admin";
  createdAt: Date;
}

export interface AuthResponse {
  message: string;
  user?: {
    id: string;
    role: string;
    fullname: string;
  };
  error?: string;
}
