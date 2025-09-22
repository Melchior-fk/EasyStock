'use client'
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import CategoryModal from '../components/CategoryModal'
import { useUser } from '@clerk/nextjs'
import { createCategory, deleteCategory, readCategories, updateCategory } from '../actions'
import { toast } from 'react-toastify'
import { Category } from '../generated/prisma'
import EmptyState from '../components/EmptyState'
import { Pencil, Trash } from 'lucide-react'

const page = () => {
  const {user} = useUser()
  const email = user?.primaryEmailAddress?.emailAddress

  const [name, setName] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([]) // You might want to fetch and set actual categories here

  const loadingCategories = async () => {
    if(email){
      const data = await readCategories(email)
      if(data){
        setCategories(data)
      }
    }  
  }

  useEffect(() => {
    loadingCategories()
  }, [email])

  const openCreateModal = () => {

    setName("")
    setEditMode(false)
    const modal = document.getElementById("category_modal") as HTMLDialogElement
    modal.showModal()
  }

  const handleCreateCategory = async () => {
    if(name === "") return
    setLoading(true)
    if(email){
      await createCategory(name, email)
    }
    await loadingCategories()
    const modal = document.getElementById("category_modal") as HTMLDialogElement
    modal.close()
    setLoading(false)
    toast.success("Catégorie ajoutée avec succès")
  }

  const handleUpdateCategory = async () => {
    if(!editingCategoryId) return
    setLoading(true)
    if(email){
      await updateCategory(editingCategoryId, email, name)
    }
    await loadingCategories()
    const modal = document.getElementById("category_modal") as HTMLDialogElement
    modal.close()
    setLoading(false)
    toast.success("Catégorie mise à jour avec succès")
  }
  
  const handleDeleteCategory = async (id : string) => {
    if(!email) return
    const confirm = window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.")
    if(!confirm) return
    await deleteCategory(id, email)
    toast.success("Catégorie supprimée avec succès")
    await loadingCategories()
  }


  const openEditModal = (category : Category) => {
    setName(category.name)
    setEditMode(true)
    setEditingCategoryId(category.id)
    const modal = document.getElementById("category_modal") as HTMLDialogElement
    modal.showModal()
  }  



  return (
    <Wrapper>
        <div>
          <div className='mb-4'>
            <button className='btn btn-primary'
            onClick={openCreateModal}
            >
              Ajouter une catégorie de produits
            </button>
          </div>

          {categories.length === 0 ? (
            <EmptyState 
              message='Aucune catégorie pour le moment'
              IconComponent='Group'
            />
          ) : (  
            <div>
              {categories.map((category) => (
                <div key={category.id} className='mb-4 p-5 border-2 border-base-200 rounded-3xl flex justify-between items-center'>
                  <div>
                    <strong className='text-lg'>{category.name}</strong>
                  </div>
                  <div className='flex gap-2'>
                    <button className='btn btn-sm' 
                    onClick={() => openEditModal(category)}>
                        <Pencil className='w-4 h-4' />
                    </button>
                     <button className='btn btn-sm btn-error' 
                    onClick={() => handleDeleteCategory(category.id)}>
                        <Trash className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}


        </div>
        

        <CategoryModal 
        name={name}
        loading={loading}
        onChangeName={setName}
        onClose={() => {
          const modal = document.getElementById("category_modal") as HTMLDialogElement
          modal.close()
        }}
        onSubmit={editMode? handleUpdateCategory : handleCreateCategory}
        editMode={editMode}
        />
    </Wrapper>
  )
}

export default page