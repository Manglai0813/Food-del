import { createContext, useState, useMemo, useCallback, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const [foodList, setFoodList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState("");

    useEffect(() => {
        const fetchFoodData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/food`);
                const result = response.data;

                if (result.success) {
                    console.log("获取数据成功:", result.data);
                    setFoodList(result.data);
                    setLoading(false);
                } else {
                    console.error(result);
                    setError(result.error || "获取数据失败");
                    setLoading(false);
                }

            } catch (error) {
                console.error(error);
                setError(error.message || "获取数据失败");
                setLoading(false);
            }
        }

        fetchFoodData();
    }, [])

    // 优化商品查找
    const foodMap = useMemo(() => {
        return foodList.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
    }, [foodList]);

    // 优化添加商品函数
    const addToCart = useCallback((itemId) => {
        if (!foodMap[itemId]) {
            console.warn(`Product with id ${itemId} not found`);
            return;
        }
        setCartItems(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
    }, [foodMap]);

    // 优化移除商品函数
    const removeFromCart = useCallback((itemId) => {
        setCartItems(prev => {
            if (!prev[itemId]) return prev;

            if (prev[itemId] === 1) {
                const newItems = { ...prev };
                delete newItems[itemId];
                return newItems;
            }

            return {
                ...prev,
                [itemId]: prev[itemId] - 1
            };
        });
    }, []);

    // 修正：将 getTotalCartAmount 改回函数形式，但在内部使用 useMemo 缓存的 foodMap
    const getTotalCartAmount = () => {
        return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
            const item = foodMap[itemId];
            if (quantity > 0 && item) {
                return total + item.price * quantity;
            }
            return total;
        }, 0);
    };

    const contextValue = {
        foodList,
        loading,
        error,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url: API_URL,
        token,
        setToken
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;