import { Request, Response, NextFunction } from "express";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.user) {
        return next();
    }
    
    res.status(401).json({ error: "Access denied. Please log in." });
};

export const checkRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.session.user && (req.session.user as any).role === role) {
            return next();
        }
        
        res.status(403).json({ error: "Forbidden. You don't have enough permissions." });
    };
};