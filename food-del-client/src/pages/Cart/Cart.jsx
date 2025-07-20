import React, { useContext } from 'react'
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {

  const { cartItems, 
          food_list, 
          removeFromCart, 
          getTotalCartAmount 
        } = useContext(StoreContext);

  const navigate = useNavigate();

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id}>
                <div className='cart-items-item'>
                  <img src={item.image} alt="" />
                  <p>{item.name}</p>
                  <p>${item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>${item.price * cartItems[item._id]}</p>
                  <p onClick={() => removeFromCart(item._id)} className='cross'>X</p>
                </div>
                <hr />
              </div>
            )
          }
          return null;
        })}
      </div>
      <div className="cart-checkout-container">
        <div className="cart-totals-section">
          <h2>Cart Totals</h2>
          <div className="total-row">
            <span>Subtotal</span>
            <span>${getTotalCartAmount()}</span>
          </div>
          <hr />
          <div className="total-row">
            <span>Delivery Fee</span>
            <span>${getTotalCartAmount() === 0 ? 0 : 5}</span>
          </div>
          <hr />
          <div className="total-row">
            <span>Total</span>
            <span>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 5}</span>
          </div>
          <button className="checkout-button" onClick={() => navigate('/order')}>
            PROCEED TO CHECKOUT
          </button>
        </div>
        <div className="promocode-section">
          <p>If you have a promo code, Enter it here</p>
          <div className="promo-input-group">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart