import { Product as PrismaProduct } from "./app/generated/prisma";

type Int = /*unresolved*/ any
export interface Product extends PrismaProduct {
    categoryName?: string;
}

export interface FormDataType {
    id?: string;
    name: string;
    price: Int;
    quantity?: number;
    unit?: string;
    categoryId?: string;
    categoryName?: string;
    imageUrl?: string;
}
