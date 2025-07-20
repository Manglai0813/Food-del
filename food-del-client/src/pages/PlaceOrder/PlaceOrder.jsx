import React, { useContext } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'

const PlaceOrder = () => {

  const { getTotalCartAmount } = useContext(StoreContext);

  return (
    <div className='place-order'>
      <div className="place-order-left">
      <p className='title'>Delivery Information</p>
      <div className="multi-fields">
        <input type="text" placeholder='First name' />
        <input type="text" placeholder='Last name' />
      </div>
      <input type="text" placeholder='Email address' />
      <input type="text" placeholder='Street' />
      <div className="multi-fields">
        <input type="text" placeholder='City' />
        <input type="text" placeholder='State' />
      </div>
      <div className="multi-fields">
        <input type="text" placeholder='Zip code' />
        <input type="text" placeholder='Country' />
      </div>
      <input type="text" placeholder='Phone number' />
      </div>
      <div className="place-order-right">
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
          <button className="checkout-button" >
            PROCEED TO PAYMENT
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlaceOrder