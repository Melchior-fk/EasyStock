'use server'

import prisma from "@/lib/prisma"
import { Category } from "./generated/prisma"

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
    description?: string
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
                description: description || "",
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
    description?: string,
) {

    if (!id || !email || !name) {
        throw new Error("L'id, l'email du commerce et le nom de la catégorie sont requis pour la mise à jour.")
    }

    try {
        const commerce = await getCommerce(email)
        if (!commerce) {
            throw new Error("Aucun compte trouvé avec cet email.");
        }

        await prisma.category.update({
            where: {
                id: id,
                commerceId: commerce.id
            },
            data: {
                name,
                description: description || "",
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