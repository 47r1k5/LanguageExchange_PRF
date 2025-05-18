import { IUser } from "../model/User";
import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";
import {ELogType} from "../enums/ELogType";
import { ERole } from "../enums/ERole";

export async function isAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.isAuthenticated()) {
      logger(ELogType.WARNING, `Unauthorized access attempt to access admin route ${req.path}`);
      res.status(401).send("User is not logged in.");
      return;
    }
  
    const user = req.user as IUser;
  
    if (user.role !== ERole.ADMIN) {
      logger(
            ELogType.WARNING,
            `Forbidden access: User ${user.email} attempted to access admin route ${req.path}`
        );
      res.status(403).send("User is not authorized.");
      return;
    }
  
    next();
  }

export async function isMentor(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.isAuthenticated()) {
      logger(ELogType.WARNING, `Unauthorized access attempt to access mentor route ${req.path}`);
      res.status(401).send("User is not logged in.");
      return;
    }
  
    const user = req.user as IUser;
  
    if (user.role !== ERole.MENTOR && user.role !== ERole.ADMIN) {
      logger(
            ELogType.WARNING,
            `Forbidden access: User ${user.email} attempted to access mentor route ${req.path}`
        );
      res.status(403).send("User is not authorized.");
      return;
    }
  
    next();
  }
