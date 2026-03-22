import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { randomUUID, UUID } from "node:crypto";
import { UserRepository, User } from "../repository/users";

export class AuthController {
  constructor(private readonly userRepository: UserRepository) {}

  public login = async (req: Request, res: Response) => {
    try {

      const { username, password } = req.body;
      console.log(username, password);
      const user = await this.userRepository.getByUsername(username);
      console.log(user);
      if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {``
        return res.status(401).json({ error: "Неверный логин или пароль" });
      }

      req.session.user = { 
        id: user.id.toString(), 
        role: user.role 
      };

      console.log(req.session.user);
      
      await this.userRepository.saveSession(req.sessionID, req.session);
      res.status(200).json({ 
        message: "Вы авторизовались", 
        user: { id: user.id, role: user.role, fullname: user.fullname } 
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при входе" });
    }
  };

  public register = async (req: Request, res: Response) => {
    try {
      const { username, password, fullname, role } = req.body;

      if (await this.userRepository.exists(username)) {
        return res.status(400).json({ error: "Пользователь уже существует" });
      }

      const hash = await bcrypt.hash(password, 10);
      const userId = randomUUID() as UUID;
      
      const newUser: User = {
        id: userId,
        username,
        fullname,
        role: role || 'user',
        password: hash,
        isDeleted: false,
        createdAt: new Date()
      };

      await this.userRepository.create(newUser);
      
      req.session.user = { 
        id: userId.toString(), 
        role: newUser.role 
      };
      await this.userRepository.saveSession(req.sessionID, req.session);
      
      res.status(201).json({ message: "Пользователь зарегистрирован" });
    } catch (error) {
      res.status(500).json({ error: "Ошибка регистрации" });
    }
  };

  public me = async (req: Request, res: Response) => {
    try {
      const isAuth = await this.userRepository.checkSession(req.sessionID);
      
      if (isAuth && req.session.user) {
        const user = await this.userRepository.getById(req.session.user.id as UUID);
        
        const { password, ...safeUser } = user;
        return res.status(200).json(safeUser);
      }
      
      res.status(401).json({ error: "Не авторизован" });
    } catch (error) {
      res.status(401).json({ error: "Сессия не найдена или истекла" });
    }
  };

  public logout = async (req: Request, res: Response) => {
    const sid = req.sessionID;
    try {
      await this.userRepository.deleteSession(sid);
      
      req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Ошибка выхода" });
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Вы вышли из аккаунта" });
      });
    } catch (error) {
      res.status(500).json({ error: "Ошибка при удалении сессии" });
    }
  };
}