import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// 擴展 Request 類型以包含用戶信息
interface AuthRequest extends Request {
  user?: any;
}

const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin permission required."
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

export { isAdmin };