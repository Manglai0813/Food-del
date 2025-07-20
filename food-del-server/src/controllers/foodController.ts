import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 定義自定義請求類型，擴展 Express.Request 以包含文件
interface FileRequest extends Request {
  file?: {
    originalname: string;
    buffer: Buffer;
  };
}

// add food item
const addFood = async (req: FileRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const fileName = req.file.originalname;
    fs.writeFileSync(path.join("public/uploads", fileName), req.file.buffer);

    const newFood = await prisma.food.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        category: req.body.category,
        image_path: `/uploads/${fileName}`,
      },
    });

    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// update food item
const updateFood = async (req: FileRequest, res: Response) => {
  try {
    let updateData: {
      name: string;
      description: string;
      price: number;
      category: string;
      image_path?: string;
    } = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
    };

    if (req.file) {
      const fileName = req.file.originalname;
      fs.writeFileSync(path.join("public/uploads", fileName), req.file.buffer);
      updateData.image_path = `/uploads/${fileName}`;
    }

    const updatedFood = await prisma.food.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: updateData,
    });

    res.json({ success: true, message: "Food Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// list food items
const listFood = async (req: Request, res: Response) => {
  try {
    // 從查詢參數獲取分頁信息
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // 計算跳過的記錄數
    const skip = (page - 1) * pageSize;

    // 使用 Prisma 查詢帶分頁的食品列表
    const foods = await prisma.food.findMany({
      where: {
        status: true,
      },
      skip: skip,
      take: pageSize,
      orderBy: {
        id: "desc", // 按 ID 降序排序，可以根據需要調整
      },
    });

    // 獲取總記錄數
    const total = await prisma.food.count({
      where: {
        status: true,
      },
    });

    res.json({
      success: true,
      data: foods,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// get food item
const getFood = async (req: Request, res: Response) => {
  try {
    const food = await prisma.food.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });

    res.json({ success: true, data: food });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// remove food item
const removeFood = async (req: Request, res: Response) => {
  try {
    await prisma.food.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        status: false,
      },
    });

    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { addFood, updateFood, listFood, getFood, removeFood };
