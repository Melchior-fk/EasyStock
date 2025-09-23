'use client'
import React, { useEffect } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { Product } from '@/type'
import { deleteProduct, readProducts } from '../actions'
import EmptyState from '../components/EmptyState'
import ProductImage from '../components/ProductImage'
import Link from 'next/link'
import { Trash } from 'lucide-react'
import { toast } from 'react-toastify'

const page = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string

    const [products, setProducts] = React.useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = React.useState<boolean>(false) // Etat pour gérer le chargement des produits
    
    const fetchProducts = async () => {
        setLoadingProducts(true)  // Activer le loader
        try {   
            if(email) {
                const products = await readProducts(email)
                if(products){
                    setProducts(products)
                }
            }
        } catch (error) {
            console.error("Erreur lors du chargement des produits", error)
        } finally {
            setLoadingProducts(false)  // Désactiver le loader une fois les produits chargés
        }
    }

    useEffect(() => {
        if(email){
            fetchProducts()
        }
    }, [email])

    const handleDeleteProduct = async (product: Product) => {
        if(!email) return
        const confirm = window.confirm("Êtes-vous sûr de vouloir supprimer ce produit?")
        if(!confirm) return
        try{
            if(product.imageUrl){
                const resDelete = await fetch('/api/upload', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ path: product.imageUrl })
                })
                const dataDelete = await resDelete.json()
                if(!dataDelete.success){
                    throw new Error("Erreur lors de la suppression de l'image")
                } else {
                    if(email && product.id){
                        await deleteProduct(product.id, email)
                        await fetchProducts()
                        toast.success("Produit supprimé avec succès")
                    }
                }
            }
        } catch(error){
            console.error(error)
            toast.error("Une erreur est survenue lors de la suppression du produit.")
        }
    }

    return (
        <Wrapper>
            <div className=''>
                {loadingProducts ? (  // Afficher le loader pendant le chargement des produits
                    <div className="flex justify-center items-center">
                        <span className="loading loading-spinner loading-lg"></span>
                        <span className="ml-2">Chargement des produits...</span>
                    </div>
                ) : products.length === 0 ? (
                    <EmptyState 
                        message='Aucun produit disponible'
                        IconComponent='PackageSearch'
                    />
                ) : (  
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {products.map((product) => (
                            <div key={product.id} className='card shadow-sm p-2 relative'>
                                <ProductImage src={product.imageUrl} alt={product.imageUrl} heightClass='h-full' widthClass='w-full' />
                                <h2 className='text-lg font-semibold mt-2'>{product.name}</h2>
                                <p className='text-primary font-bold'>Prix: {product.price} Frfca</p>
                                <p className='text-gray-600 font-bold'>Quantité: {product.quantity} {product.unit}</p>
                                <div className='flex space-x-2 mt-8'>
                                    <Link href={`/update-product/${product.id}`} className='btn btn-sm btn-primary'>Modifier</Link>
                                    <button
                                        onClick={() => handleDeleteProduct(product)}
                                        className='btn btn-sm btn-error'
                                    ><Trash className='w-4 h-4' />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Wrapper>
    )
}

export default page

                            