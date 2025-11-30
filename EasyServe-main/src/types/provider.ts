export interface Provider {
    id: string;
    name: string;
    categoryId: string;
    categoryName?: string;
    price: number;
    area: string;
    rating: number;
    description: string;
    image?: string;
    reviews?: Review[];
    createdAt?: Date;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: Date;
}