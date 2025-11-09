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

// すべてのカートルートに認証ミドルウェアを適用
cartRouter.use(isAuthenticated);

// カート関連のルート定義
cartRouter.get('/', getCart); 

// カートに商品を追加
cartRouter.post('/add', validateBody(AddToCartSchema), addToCart); 

//  カート内の商品を更新
cartRouter.put('/items/:id', validateParams(IdParamsSchema), validateBody(UpdateCartItemSchema), updateCartItem); 

// カートから商品を削除
cartRouter.delete('/items/:id', validateParams(IdParamsSchema), removeCartItem);

// カートを空にする
cartRouter.delete('/clear', clearCart);

//  チェックアウト処理
cartRouter.post('/checkout', validateBody(CreateOrderSchema), checkout);

export default cartRouter;