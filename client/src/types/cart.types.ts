export type SubscriptionType = 'individual' | 'business';
export type BillingCycle = 'monthly' | 'quarterly' | 'annual' | 'custom';
export type BusinessTier = 'starter' | 'growth' | 'enterprise';

export interface CartItem {
	id: string;
	type: SubscriptionType;
	billingCycle: BillingCycle;
	price: number;
	quantity: number;
	recipientInfo?: RecipientInfo;
	businessInfo?: BusinessInfo;
	isGift?: boolean;
}

export interface RecipientInfo {
	firstName: string;
	lastName: string;
	email: string;
	address: {
		line1: string;
		line2?: string;
		city: string;
		state: string;
		postalCode: string;
		country: string;
	};
	giftMessage?: string;
}

export interface BusinessInfo {
	companyName: string;
	tier: BusinessTier;
	employeeCount: number;
	contactPerson: {
		name: string;
		email: string;
		phone: string;
	};
}

export interface CartContextType {
	items: CartItem[];
	addToCart: (item: Omit<CartItem, 'id'>) => void;
	removeFromCart: (id: string) => void;
	updateQuantity: (id: string, quantity: number) => void;
	updateRecipientInfo: (id: string, info: RecipientInfo) => void;
	clearCart: () => void;
	getTotalPrice: () => number;
	getTotalItems: () => number;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}
