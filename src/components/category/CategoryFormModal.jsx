import React, { useState, useEffect } from 'react';
import './CategoryFormModal.css'; 

const CATEGORY_TYPES = ['PRODUCTO', 'SERVICIO']; 

const CategoryFormModal = ({ isOpen, onClose, onSave, categoryData, isSaving }) => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState(CATEGORY_TYPES[0]); 

    useEffect(() => {
        if (isOpen) {
            if (categoryData && categoryData.id) { 
                setNombre(categoryData.nombre || '');
                setTipo(categoryData.tipo || CATEGORY_TYPES[0]);
            } else { 
                setNombre('');
                setTipo(CATEGORY_TYPES[0]);
            }
        }
    }, [categoryData, isOpen]); 

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            alert("El nombre de la categoría no puede estar vacío.");
            return;
        }
        onSave({ nombre, tipo });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay-category">
            <div className="modal-content-category">
                <h2>{categoryData && categoryData.id ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="category-nombre">Nombre:</label>
                        <input
                            type="text"
                            id="category-nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            disabled={isSaving}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category-tipo">Tipo:</label>
                        <select
                            id="category-tipo"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            disabled={isSaving}
                            required
                        >
                            {CATEGORY_TYPES.map(typeValue => (
                                <option key={typeValue} value={typeValue}>
                                    {typeValue}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="modal-button save" disabled={isSaving}>
                            {isSaving ? (categoryData && categoryData.id ? 'Actualizando...' : 'Creando...') : (categoryData && categoryData.id ? 'Actualizar' : 'Crear')}
                        </button>
                        <button type="button" onClick={onClose} className="modal-button cancel" disabled={isSaving}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal;