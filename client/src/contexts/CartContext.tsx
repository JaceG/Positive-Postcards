import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartContextType, RecipientInfo } from '../types/cart.types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [items, setItems] = useState<CartItem[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	// Load cart from localStorage on mount
	useEffect(() => {
		const savedCart = localStorage.getItem('positivePostcardsCart');
		if (savedCart) {
			try {
				const parsedCart = JSON.parse(savedCart);
				if (Array.isArray(parsedCart)) {
					setItems(parsedCart);
				}
			} catch (error) {
				console.error('Error loading cart from localStorage:', error);
			}
		}
	}, []);

	// Save cart to localStorage whenever it changes
	useEffect(() => {
		if (items.length > 0) {
			localStorage.setItem(
				'positivePostcardsCart',
				JSON.stringify(items)
			);
		} else {
			localStorage.removeItem('positivePostcardsCart');
		}
	}, [items]);

	const addToCart = (item: Omit<CartItem, 'id'>) => {
		const newItem: CartItem = {
			...item,
			id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
		};
		setItems((prevItems) => [...prevItems, newItem]);
		setIsOpen(true); // Open cart when item is added
	};

	const removeFromCart = (id: string) => {
		setItems((prevItems) => prevItems.filter((item) => item.id !== id));
	};

	const updateQuantity = (id: string, quantity: number) => {
		if (quantity <= 0) {
			removeFromCart(id);
			return;
		}
		setItems((prevItems) =>
			prevItems.map((item) =>
				item.id === id ? { ...item, quantity } : item
			)
		);
	};

	const updateRecipientInfo = (id: string, info: RecipientInfo) => {
		setItems((prevItems) =>
			prevItems.map((item) =>
				item.id === id ? { ...item, recipientInfo: info } : item
			)
		);
	};

	const clearCart = () => {
		setItems([]);
		localStorage.removeItem('positivePostcardsCart');
	};

	const getTotalPrice = () => {
		return items.reduce(
			(total, item) => total + item.price * item.quantity,
			0
		);
	};

	const getTotalItems = () => {
		return items.reduce((total, item) => total + item.quantity, 0);
	};

	const value: CartContextType = {
		items,
		addToCart,
		removeFromCart,
		updateQuantity,
		updateRecipientInfo,
		clearCart,
		getTotalPrice,
		getTotalItems,
		isOpen,
		setIsOpen,
	};

	return (
		<CartContext.Provider value={value}>{children}</CartContext.Provider>
	);
};
