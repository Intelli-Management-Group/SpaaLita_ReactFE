import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
    category?: string;
}

interface CartState {
    items: CartItem[];
    lastAddedItem: CartItem | null;
    appliedCoupon?: string;       // store coupon code
    discountAmount?: number;      // store discount value
    freeShippingAmount?: number;  // optional
    totalAfterDiscount?: number;  // optional
}

const initialState: CartState = {
    items: [],
    lastAddedItem: null,
    appliedCoupon: undefined,
    discountAmount: 0,
    freeShippingAmount: 0,
    totalAfterDiscount: 0,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Omit<CartItem, 'qty'> & { qty?: number }>) => {
            const existingItem = state.items.find(item => item.id === action.payload.id);

            if (existingItem) {
                existingItem.qty += action.payload.qty || 1;
            } else {
                state.items.push({
                    ...action.payload,
                    qty: action.payload.qty || 1
                });
            }

            state.lastAddedItem = {
                ...action.payload,
                qty: action.payload.qty || 1
            };
        },

        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },

        updateQuantity: (state, action: PayloadAction<{ id: string; qty: number }>) => {
            const item = state.items.find(item => item.id === action.payload.id);
            if (item) {
                item.qty = action.payload.qty;
            }
        },

        applyCouponToCart: (
            state,
            action: PayloadAction<{
                couponCode: string;
                discountAmount: number;
                freeShippingAmount?: number;
                totalAfterDiscount: number;
            }>
        ) => {
            state.appliedCoupon = action.payload.couponCode;
            state.discountAmount = action.payload.discountAmount;
            state.freeShippingAmount = action.payload.freeShippingAmount || 0;
            state.totalAfterDiscount = action.payload.totalAfterDiscount;
        },

        removeCoupon: (state) => {
            state.appliedCoupon = undefined;
            state.discountAmount = 0;
            state.freeShippingAmount = 0;
            // recalculate total after discount to be just the cart total
            state.totalAfterDiscount = state.items.reduce(
                (total, item) => total + item.price * item.qty,
                0
            );
        },

        clearCart: (state) => {
            state.items = [];
            state.lastAddedItem = null;
        },

        clearLastAddedItem: (state) => {
            state.lastAddedItem = null;
        },

        /**
         * Take the prices and coupon discount the backend priced the cart with
         * (checkout's CART_CHANGED response), so the customer sees, and then
         * pays, the amount that will actually be charged.
         */
        syncCartWithCheckout: (state, action: PayloadAction<CheckoutCart>) => {
            for (const line of action.payload.items) {
                const item = state.items.find(item => item.id === line.productId);
                if (item) {
                    item.price = line.price;
                    item.name = line.name || item.name;
                }
            }

            const coupon = action.payload.coupon;
            state.appliedCoupon = coupon?.couponCode;
            state.discountAmount = coupon?.discountAmount ?? 0;
            state.freeShippingAmount = coupon?.freeShippingAmount ?? 0;
            state.totalAfterDiscount = coupon?.totalAfterDiscount ?? action.payload.totalAmount;
        }
    }
});

/** The cart as priced by the backend at checkout */
export interface CheckoutCart {
    items: { productId: string; name: string; price: number; qty: number }[];
    subtotal: number;
    coupon: { couponCode: string; discountAmount: number; freeShippingAmount: number; totalAfterDiscount: number } | null;
    totalAmount: number;
}

export const {
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCouponToCart,
    removeCoupon,
    clearCart,
    clearLastAddedItem,
    syncCartWithCheckout
} = cartSlice.actions;

export default cartSlice.reducer;
