'use client'
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { Category } from '../generated/prisma'
import { FormDataType } from '@/type'
import { createProduct, readCategories } from '../actions'
import { FileImage } from 'lucide-react'
import ProductImage from '../components/ProductImage'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const page = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    const router = useRouter()

    const [file, setFile] = React.useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const [categories, setCategories] = React.useState<Category[]>([])
    const [formData, setFormData] = React.useState<FormDataType>({
        name: "",
        price: 0,
        quantity: 0,
        categoryId: "",
        imageUrl: ""
    })
    const [loading, setLoading] = useState(false)  // Nouvel état pour gérer le chargement

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                if (email) {
                    const data = await readCategories(email)
                    if (data) {
                        setCategories(data)
                    }
                }
            } catch (error) {
                console.error("Erreur lors du chargement des catégories")
            }
        }
        fetchCategories()
    }, [email])

    // Fonction de validation
    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error("Le nom du produit ne peut pas être vide.")
            return false
        }

        // Vérifier la catégorie
        if (!formData.categoryId) {
            toast.error("Veuillez sélectionner une catégorie.")
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!file) {
            toast.error('Veuillez sélectionner une image.')
            return
        }

        if (!validateForm()) return

        // Démarrer le loader
        setLoading(true)

        try {
            const imageData = new FormData()
            imageData.append('file', file)
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: imageData
            })
            const data = await res.json()
            if (!data.success) {
                throw new Error("Erreur lors de l'upload de l'image")
            } else {
                formData.imageUrl = data.path
                await createProduct(formData, email)
                toast.success('Produit créé avec succès')
                router.push('/products')
            }
        } catch (error) {
            console.error(error)
            toast.error("Une erreur est survenue")
        } finally {
            // Arrêter le loader
            setLoading(false)
        }
    }

    return (
        <Wrapper>
            <div className='flex justify-center items-center'>
                <div>
                    <h1 className='text-2xl font-bold mb-4'>Créer votre produit</h1>
                    <section className='flex md:flex-row flex-col'>
                        <div className='space-y-4 md:w-[450px]'>
                            <input type="text" name='name' placeholder='Nom du produit'
                                className='input input-bordered w-full'
                                value={formData.name}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Optionally, you can restrict input here or just update state
                                    if(/^[a-zA-Z0-9]+$/.test(value) || value === '') {
                                        setFormData({ ...formData, name: value });
                                    }
                                }}
                            />

                            <div className='relative'>
                                <input
                                    type="text" // Utilisation de type "text" pour gérer uniquement les chiffres sans validation de type "number"
                                    name="price"
                                    placeholder="Prix"
                                    className="input input-bordered w-full pr-16"
                                    value={formData.price || ''}  // Si la valeur est NaN ou 0, le champ est vide
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Si la valeur est une chaîne vide, on laisse le champ vide
                                        if (value === '') {
                                            setFormData({
                                                ...formData,
                                                price: 0
                                            });
                                        } else if (/^[1-9]\d*$/.test(value)) {
                                            // Si la valeur est un nombre valide entre 1 et 9, on la met à jour
                                            setFormData({
                                                ...formData,
                                                price: parseInt(value)
                                            });
                                        } else {
                                            // Si la valeur est invalide, on empêche la mise à jour
                                            setFormData({
                                                ...formData,
                                                price: formData.price // Garder la valeur précédente si c'est une entrée invalide
                                            });
                                        }
                                    }}
                                />

                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">Frfca</span>
                            </div>

                            <select className='select select-bordered w-full'
                                name='categoryId'
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                value={formData.categoryId}>
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <input type="file"
                                accept='image/*'
                                placeholder='Image du produit'
                                className='file-input file-input-bordered w-full'
                                onChange={(e) => {
                                    const selectedFile = e.target.files ? e.target.files[0] : null;
                                    setFile(selectedFile);
                                }}
                            />

                            <button
                                onClick={handleSubmit}
                                className={`btn btn-primary ${loading ? 'cursor-wait' : ''}`} // Ajout d'un curseur de chargement
                                disabled={loading} // Désactiver le bouton pendant le chargement
                            >
                                {loading ? 'Création...' : 'Créer mon produit'} {/* Afficher "Création..." pendant le chargement */}
                            </button>
                        </div>

                        <div className='md:ml-4 md:w-[300px] mt-4 md:mt-0 border-2 border-primary md:h-[300px] 
                            p-2 flex justify-center items-center rounded-3xl'>
                            {file ? (
                                <ProductImage src={URL.createObjectURL(file)} alt='Preview' heightClass='h-full' widthClass='w-full' />
                            ) : (
                                <div className='flex flex-col justify-center items-center gap-2 wiggle-animation'>
                                    <FileImage strokeWidth={1} className='h-10 w-10 text-primary' />
                                    <p className='text-gray-500 text-center'>Aperçu de l'image du produit</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </Wrapper>
    )
}

export default page
