export default interface Invoice {
    customerId?: string; // if selected from list
    customerName: string;
    customerGST?: string;

    billDate?: any;
    items: {
        description: string;
        quantity: number;
        price: number;
        total: number;
    }[];

    isGST: boolean;
    vechileNumber?: string; // e.g. 18
    subtotal: number;
    gstAmount?: number;
    finalTotal: number;
    createdAt?: any;
}
