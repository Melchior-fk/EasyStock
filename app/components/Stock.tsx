'use client'
import React, { useEffect } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { Product } from '@/type'
import { deleteProduct, readProducts, replenishStockWithTransaction } from '../actions'
import ProductComponent from './ProductComponent'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const Stock = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress
    const router = useRouter()

    const [products, setProducts] = React.useState<Product[]>([])
    const [selectedProductId, setSelectedProductId] = React.useState<string>('')
    const [quantity, setQuantity] = React.useState<number>(0)
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
    const [loadingProducts, setLoadingProducts] = React.useState<boolean>(false)
    const [loadingReplenish, setLoadingReplenish] = React.useState<boolean>(false) // Nouvel état pour gérer le chargement du réapprovisionnement

    const fetchProducts = async () => {
        setLoadingProducts(true)
        try {
            if (email) {
                const products = await readProducts(email)
                if (products) {
                    setProducts(products)
                }
            }
        } catch (error) {
            console.error("Erreur lors du chargement des produits", error)
        } finally {
            setLoadingProducts(false)
        }
    }

    useEffect(() => {
        if (email) {
            fetchProducts()
        }
    }, [email])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedProductId || quantity <= 0) {
            toast.error("Veuillez sélectionner votre produit et votre quantité")
            return
        }

        // Démarrer le loader
        setLoadingReplenish(true)

        try {
            if (email) {
                await replenishStockWithTransaction(selectedProductId, quantity, email)
            }
            toast.success("Stock réapprovisionné")

            // Rafraîchissement de la page des produits après la mise à jour
            router.replace('/products')  // Utilisation de `router.replace` pour recharger la page sans ajouter d'entrée dans l'historique du navigateur

            // Réinitialisation des champs
            setSelectedProductId('')
            setQuantity(0)
            setSelectedProduct(null)
            const modal = document.getElementById('my_modal_stock') as HTMLDialogElement
            if (modal) {
                modal.close()
            }
        } catch (error) {
            console.error(error)
        } finally {
            // Arrêter le loader
            setLoadingReplenish(false)
        }
    }

    return (
        <div>
            <dialog id="my_modal_stock" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Gestion de votre stock</h3>
                    <p className="py-4">Mettre à jour les quantités de votre produit</p>
                    <form className='space-y-2' onSubmit={handleSubmit}>
                        <select value={selectedProductId}
                            className='select select-bordered w-full'
                            required
                            onChange={(e) => {
                                const productId = e.target.value
                                setSelectedProductId(productId)
                                const product = products.find(p => p.id === productId) || null
                                setSelectedProduct(product)
                            }}
                        >
                            <option value="">Sélectionner un produit</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                        {selectedProduct && (
                            <ProductComponent product={selectedProduct} />
                        )}

                        <label htmlFor="">Quantité à ajouter</label>
                       <input
                            type="number"
                            placeholder='Ajouter une quantité'
                            value={quantity}
                            required
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                // Validation : la quantité ne peut pas être négative
                                if (value >= 0) {
                                    setQuantity(value);  // Mettre à jour la quantité si la valeur est valide
                                } else {
                                    toast.error("La quantité ne peut pas être négative");  // Afficher un message d'erreur si la valeur est négative
                                }
                            }}
                            className='input input-bordered w-full'
                        />

                        <button
                            type='submit'
                            className={`btn btn-primary w-fit ${loadingReplenish ? 'cursor-wait' : ''}`}
                            disabled={loadingReplenish}  // Désactive le bouton pendant le chargement
                        >
                            {loadingReplenish ? 'Réapprovisionnement...' : 'Ajouter au stock'}
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    )
}

export default Stock
