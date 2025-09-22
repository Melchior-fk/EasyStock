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
            <div className='overflow-x-auto w-full'>
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
                    <table className='table w-full'>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Image</th>
                                <th>Nom</th>
                                <th>Prix</th>
                                <th>Catégorie</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product.id}>
                                    <th>#{index + 1}</th>
                                    <td>
                                        <ProductImage src={product.imageUrl} alt={product.imageUrl} heightClass='h-32' widthClass='w-32'/>
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.price} Frcfa</td>
                                    <td>{product.categoryName}</td>
                                    <td className='space-x-2'>
                                        <Link className='btn btn-xs w-fit btn-primary' href={`/update-product/${product.id}`}>Modifier</Link>
                                        <button onClick={() => handleDeleteProduct(product)} className='btn btn-xs w-fit'>
                                            <Trash className='w-4 h-4'/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Wrapper>
    )
}

export default page
