import express, { Router } from 'express';
import {
        getCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        checkout
} from '@/controllers/cartController';
import { isAuthenticated } from '@/middleware/authMiddleware';
import { validateBody, validateParams, IdParamsSchema } from '@/middleware/validation';
import {
        AddToCartSchema,
        UpdateCartItemSchema,
        CreateOrderSchema
} from '@/types/utils/validation';

// カートルーターの作成
const cartRouter: Router = express.Router();

// すべてのカート操作にはユーザー認証が必要
cartRouter.use(isAuthenticated);

// カートのルート定義
cartRouter.get('/', getCart);                // カートを取得
cartRouter.post('/add', validateBody(AddToCartSchema), addToCart);            // 商品を追加（データ検証付き）
cartRouter.put('/items/:id', validateParams(IdParamsSchema), validateBody(UpdateCartItemSchema), updateCartItem);  // 数量を更新（ID・データ検証付き）
cartRouter.delete('/items/:id', validateParams(IdParamsSchema), removeCartItem); // 商品を削除（ID検証付き）
cartRouter.delete('/clear', clearCart);        // カートを空にする
cartRouter.post('/checkout', validateBody(CreateOrderSchema), checkout);        // 精算（注文データ検証付き）

export default cartRouter;