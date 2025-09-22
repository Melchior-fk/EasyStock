'use server'

import prisma from "@/lib/prisma"
import { Category, Product } from "./generated/prisma"
import { FormDataType } from "@/type"

export async function checkAndAddCommerce(email: string, name: string) {
    if (!email) return
    try {
        const existingCommerce = await prisma.commerce.findUnique({
            where: {
                email
            }
        })
        if (!existingCommerce && name) {
            await prisma.commerce.create({
                data: {
                    email, name
                }
            })
        }

    } catch (error) {
        console.error(error)
    }
}

export async function getCommerce(email: string) {
    if (!email) return
    try {
        const existingCommerce = await prisma.commerce.findUnique({
            where: {
                email
            }
        })
        return existingCommerce
    } catch (error) {
        console.error(error)
    }
}

export async function createCategory(
    name: string,
    email: string,
) {

    if (!name) return
    try {
        const commerce = await getCommerce(email)
        if (!commerce) {
            throw new Error("Aucun compte trouvé avec cet email.");
        }
        await prisma.category.create({
            data: {
                name,
                commerceId: commerce.id
            }
        })

    } catch (error) {
        console.error(error)
    }
}

export async function updateCategory(
    id: string,
    email: string,
    name: string,
) {

    if (!id || !email || !name) {
        throw new Error("L'id, l'email du commerce et le nom de la catégorie sont requis pour la mise à jour.")
    }

    try {
        const commerce = await getCommerce(email)
        if (!commerce) {
            throw new Error("Aucun commerce trouvé avec cet email.");
        }

        await prisma.category.update({
            where: {
                id: id,
                commerceId: commerce.id
            },
            data: {
                name,
            }
        })

    } catch (error) {
        console.error(error)
    }
}


export async function deleteCategory(id: string, email: string) {
    if (!id || !email) {
        throw new Error("L'id, l'email du commerce et sont requis.")
    }

    try {
        const association = await getCommerce(email)
        if (!association) {
            throw new Error("Aucun compte trouvé avec cet email.");
        }

        await prisma.category.delete({
            where: {
                id: id,
                commerceId: association.id
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function readCategories(email: string): Promise<Category[] | undefined> {
    if (!email) {
        throw new Error("l'email du commerce est  requis")
    }

    try {
        const commerce = await getCommerce(email)
        if (!commerce) {
            throw new Error("Aucun compte trouvée avec cet email.");
        }

        const categories = await prisma.category.findMany({
            where: {
                commerceId: commerce.id
            }
        })
        return categories
    } catch (error) {
        console.error(error)
    }
}

export async function createProduct(formData: FormDataType, email: string) {
    try {
        const { name, price, imageUrl, categoryId } = formData;
        if (!email || !price || !categoryId || !email) {
            throw new Error("Le nom, le prix, la catégorie et l'email du commerce sont requis pour la création du produit.")
        }
        const safeImageUrl = imageUrl || ""

        const commerce = await getCommerce(email)
        if (!commerce) {
            throw new Error("Aucun Commerce trouvée avec cet email.");
        }

        await prisma.product.create({
            data: {
                name,
                price: Number(price),
                imageUrl: safeImageUrl,
                categoryId,
                commerceId: commerce.id
            }
        })

    } catch (error) {
        console.error(error)
    }
}

export async function updateProduct(formData: FormDataType, email: string) {
    try {
        const { id, name, price, imageUrl } = formData;
        if (!email || !price || !id || !email) {
            throw new Error("L'id, le nom, le prix et l'email sont requis pour la mise à jour du produit.")
        }

        const commerce = await getCommerce(email)
        if (!commerce) {
            throw new Error("Aucun Commerce trouvée avec cet email.");
        }

        await prisma.product.update({
            where: {
                id: id,
                commerceId: commerce.id
            },
            data: {
                name,
                price: Number(price),
                imageUrl: imageUrl,
            }
        })

    } catch (error) {
        console.error(error)
    }
}

export async function deleteProduct(id: string, email: string) {
    try {
        if (!id) {
            throw new Error("L'id est requis pour la suppression.")
        }

        const association = await getCommerce(email)
        if (!association) {
            throw new Error("Aucun commerce trouvée avec cet email.");
        }

        await prisma.product.delete({
            where: {
                id: id,
                commerceId: association.id
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function readProducts(email: string): Promise<Product[] | undefined> {
    try {
        if (!email) {
            throw new Error("l'email est requis .")
        }

        const commerce = await getCommerce(email)
        if (!commerce) {
            throw new Error("Aucun commerce trouvée avec cet email.");
        }

        const products = await prisma.product.findMany({
            where: {
                commerceId: commerce.id
            },
            include: {
                category: true
            }
        })

        return products.map(product => ({
            ...product,
            categoryName: product.category?.name
        }))

    } catch (error) {
        console.error(error)
    }
}


type ProductWithCategoryName = Product & { categoryName?: string };

export async function readProductById(productId: string, email: string): Promise<ProductWithCategoryName | undefined> {
    try {
        if (!email) {
            throw new Error("l'email est requis .")
        }

        const commerce = await getCommerce(email)
        if (!commerce) {
            throw new Error("Aucun compte trouvée avec cet email.");
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId,
                commerceId: commerce.id
            },
            include: {
                category: true
            }
        })
        if (!product) {
            return undefined
        }

        return {
            ...product,
            categoryName: product.category?.name
        }
    } catch (error) {
        console.error(error)
    }
}
