// Ruta: src/pages/CategoryManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllCategories, deleteCategory, createCategory, updateCategory } from '../services/categoryService';
import ConfirmModal from '../components/common/ConfirmModal';
import CategoryFormModal from '../components/category/CategoryFormModal'; // Este es el modal del formulario
import { toast } from 'react-toastify';
import './UserManagementPage.css'; // Reusando estilos por simplicidad (o crea CategoryManagementPage.css)
import '../components/category/CategoryFormModal.css'; // Estilos para el nuevo modal

const CategoryManagementPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorPage, setErrorPage] = useState(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setErrorPage(null);
            const data = await getAllCategories();
            setCategories(data);
        } catch (err) {
            const errorMessage = err.message || 'No se pudieron cargar las categorías.';
            setErrorPage(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const requestDeleteCategory = (category) => {
        if (isDeleting) return;
        setCategoryToDelete(category);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (categoryToDelete) {
            setIsDeleting(true);
            try {
                await deleteCategory(categoryToDelete.id);
                toast.success(`Categoría "${categoryToDelete.nombre}" eliminada con éxito.`);
                fetchCategories(); 
            } catch (err) {
                toast.error(err.message || 'Error al eliminar la categoría. Podría estar en uso.');
            } finally {
                setIsConfirmModalOpen(false);
                setCategoryToDelete(null);
                setIsDeleting(false);
            }
        }
    };

    const handleCancelDelete = () => {
        if (isDeleting) return;
        setIsConfirmModalOpen(false);
        setCategoryToDelete(null);
    };

    const handleOpenCategoryModal = (category = null) => {
        setEditingCategory(category); 
        setIsCategoryModalOpen(true);
    };

    const handleCloseCategoryModal = () => {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const handleSaveCategory = async (categoryData) => {
        setIsSavingCategory(true);
        try {
            if (editingCategory && editingCategory.id) {
                const updatedCategory = await updateCategory(editingCategory.id, categoryData);
                toast.success(`Categoría "${updatedCategory.nombre}" actualizada con éxito.`);
            } else {
                const newCategory = await createCategory(categoryData);
                toast.success(`Categoría "${newCategory.nombre}" creada con éxito.`);
            }
            fetchCategories(); 
            handleCloseCategoryModal();
        } catch (err) {
            // El servicio ya debería formatear el error del backend
            toast.error(err.message || 'Error al guardar la categoría.');
        } finally {
            setIsSavingCategory(false);
        }
    };

    if (loading) return <div>Cargando categorías...</div>;
    if (errorPage && categories.length === 0) return <div style={{ color: 'red', padding: '20px' }}>Error: {errorPage}</div>;

    return (
        <div className="user-management-page"> 
            <h1>Gestión de Categorías</h1>
            <button 
                onClick={() => handleOpenCategoryModal()} 
                className="add-button" 
                style={{marginBottom: '20px', padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
            >
                + Añadir Nueva Categoría
            </button>

            {categories.length === 0 && !loading && !errorPage ? (
                <p>No hay categorías para mostrar.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Tipo</th> 
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.nombre}</td>
                                <td>{category.tipo}</td> 
                                <td>
                                    <button 
                                        onClick={() => handleOpenCategoryModal(category)} 
                                        className="edit-roles-button" 
                                        style={{marginRight: '10px'}}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => requestDeleteCategory(category)} 
                                        className="delete-button" 
                                        disabled={isDeleting && categoryToDelete?.id === category.id}
                                    >
                                        {isDeleting && categoryToDelete?.id === category.id ? 'Eliminando...' : 'Eliminar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar la categoría "${categoryToDelete?.nombre}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText={isDeleting ? "Eliminando..." : "Sí, Eliminar"}
                cancelText="No, Cancelar"
                isConfirmDisabled={isDeleting}
                isCancelDisabled={isDeleting}
            />

            {isCategoryModalOpen && (
                <CategoryFormModal
                    isOpen={isCategoryModalOpen} // Esta prop es para el modal en sí, no necesita ser controlada por el form
                    onClose={handleCloseCategoryModal}
                    onSave={handleSaveCategory}
                    categoryData={editingCategory} 
                    isSaving={isSavingCategory}
                />
            )}
        </div>
    );
};

export default CategoryManagementPage;