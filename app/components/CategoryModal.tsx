import React from 'react'

interface Props {
    name: string,
    loading: boolean,
    onClose: () => void,
    onChangeName: (value : string) => void,
    onSubmit: (e: React.FormEvent) => void,
    editMode?: boolean
}

const CategoryModal: React.FC<Props> = ({
    name, loading, onClose, onChangeName, onSubmit, editMode = false
}) => {
  return (
    <dialog id="category_modal" className="modal">
        <div className="modal-box">
            <form method="dialog">
            <button onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-lg">{editMode? "Modifier la catégorie" : "Nouvelle catégorie"}</h3>
            <input type="text" 
            placeholder='Nom' 
            value={name} 
            onChange={(e) => onChangeName(e.target.value)}
            className='input input-bordered w-full my-4'
            />

            <button 
            onClick={onSubmit}
            disabled={loading}
            className={`btn btn-primary w-full ${loading && "chargement"}`}>
                {editMode? "Modifier" : "Ajouter"}
            </button>
        </div>
    </dialog>
  )
}

export default CategoryModal