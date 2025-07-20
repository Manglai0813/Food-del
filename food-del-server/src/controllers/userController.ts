import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const prisma = new PrismaClient();

// 定義用戶接口
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role?: string;
}

// create JWT token
const createToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
}

// login user
const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "All fields are required"
      });
      return;
    }

    // check if user exists
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User does not exist"
      });
      return;
    }

    // verify password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(404).json({
        success: false,
        message: "Incorrect password"
      });
      return;
    }

    // create token
    const token = createToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Error during login. Please try again later."
    });
  }
}

// register user
const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, password, email } = req.body;

  try {
    // validate input
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "All fields are required"
      });
      return;
    }

    // checking is user already exists
    const exists = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (exists) {
      res.status(409).json({
        success: false,
        message: "User already exists"
      });
      return;
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: "Please enter a strong password"
      });
      return;
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user using Prisma
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    // create token
    const token = createToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: "This email is already registered"
      });
      return;
    }
    if (error.code === 'P2000') {
      res.status(400).json({
        success: false,
        message: "Input data is too long"
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Error during registration. Please try again later."
    });
  }
}

// logout user
const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: "Error during logout. Please try again later."
    });
  }
}

export { loginUser, registerUser, logoutUser };