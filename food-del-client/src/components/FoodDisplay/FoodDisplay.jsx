import React, { useContext } from 'react'
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category }) => {
    const { foodList, loading, error } = useContext(StoreContext);

    // 处理加载状态
    if (loading) {
        return(
            <div className="food_display">
                <h2>Loading dishes...</h2>
            </div>
        )
    }

    // 处理错误状态
    if (error) {
        return (
            <div className="food_display">
                <h2>{error}</h2>
            </div>
        )
    }

    return (
        <div className='food-display' id='food-display'>
            <h2>Top dishes near you</h2>
            <div className="food-display-list">
                {foodList.map((item, index) => {
                    if (category === "All" || category === item.category) {
                        return <FoodItem
                            key={index}
                            id={item.id}
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image_path} />
                    }

                    return null;
                })}
            </div>
        </div>
    )
}

export default FoodDisplay