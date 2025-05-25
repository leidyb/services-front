// Ruta: src/pages/ProductListPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // useCallback añadido
import { getAllProducts, deleteProduct } from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import ConfirmModal from '../components/common/ConfirmModal';
import { toast } from 'react-toastify';
import './ProductListPage.css'; // Asegúrate que este CSS existe

// Componente simple para los botones de paginación
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    // Lógica simple para mostrar algunos números de página y puntos suspensivos
    // Para una lógica más avanzada, se podría usar una librería de paginación
    if (totalPages <= 7) { // Mostrar todos si son pocos
        for (let i = 0; i < totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(0); // Primera página
        if (currentPage > 2) pageNumbers.push('...');

        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages - 2, currentPage + 1);

        if (currentPage <= 2) endPage = Math.min(totalPages - 2, 3);
        if (currentPage >= totalPages - 3) startPage = Math.max(1, totalPages - 4);


        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (currentPage < totalPages - 3) pageNumbers.push('...');
        pageNumbers.push(totalPages - 1); // Última página
    }


    return (
        <div className="pagination-controls">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}>
                Anterior
            </button>
            {pageNumbers.map((number, index) =>
                typeof number === 'string' ? (
                    <span key={`ellipsis-${index}`} className="ellipsis">{number}</span>
                ) : (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={currentPage === number ? 'active' : ''}
                    >
                        {number + 1} {/* Mostramos página 1 en lugar de 0 */}
                    </button>
                )
            )}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages - 1 || totalPages === 0}>
                Siguiente
            </button>
        </div>
    );
};


const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorPage, setErrorPage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // --- ESTADOS PARA PAGINACIÓN ---
    const [currentPage, setCurrentPage] = useState(0); // Página actual (0-indexed)
    const [totalPages, setTotalPages] = useState(0);   // Total de páginas
    const [totalElements, setTotalElements] = useState(0); // Total de productos
    const PAGE_SIZE = 9; // Productos por página (puedes ajustarlo)

    // Usamos useCallback para memorizar fetchProductsData y evitar re-ejecuciones innecesarias del useEffect
    const fetchProductsData = useCallback(async (termToSearch = '', page = 0) => {
        try {
            setLoading(true);
            setErrorPage(null);
            // Ahora getAllProducts devuelve el objeto Page completo
            const pageData = await getAllProducts(termToSearch, page, PAGE_SIZE);
            setProducts(pageData.content); // Los productos están en 'content'
            setTotalPages(pageData.totalPages);
            setCurrentPage(pageData.number); // La API devuelve la página actual (number)
            setTotalElements(pageData.totalElements);

            if (termToSearch && pageData.content.length > 0) {
                // toast.info(...);
            } else if (termToSearch && pageData.content.length === 0) {
                toast.warn(`No se encontraron productos para "${termToSearch}".`);
            }
        } catch (err) {
            setErrorPage('No se pudieron cargar los productos.');
            toast.error('Error al cargar productos.'); 
        } finally {
            setLoading(false);
        }
    }, []); // useCallback no tiene dependencias aquí porque searchTerm y page se pasan como args

    // Efecto para la carga inicial y cuando cambie la página actual o el término de búsqueda forzado
    useEffect(() => {
        fetchProductsData(searchTerm, currentPage);
    }, [currentPage, fetchProductsData]); // Se re-ejecuta si currentPage o la función fetch (memoizada) cambia
                                        // OJO: si searchTerm cambiara aquí directamente, causaría re-fetch.
                                        // Lo manejamos con handleSearchSubmit para que el fetch sea explícito en la búsqueda.

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const requestDeleteProduct = (id, name) => { /* ... sin cambios ... */ 
        if (isDeleting) return; 
        setProductToDelete({ id, name });
        setIsConfirmModalOpen(true);
    };
    const handleCancelDelete = () => { /* ... sin cambios ... */ 
        if (isDeleting) return;
        setIsConfirmModalOpen(false);
        setProductToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (productToDelete) {
            setIsDeleting(true);
            try {
                await deleteProduct(productToDelete.id);
                toast.success(`¡Producto "${productToDelete.name}" eliminado con éxito!`);
                // Volver a cargar los productos de la página actual para reflejar la eliminación
                // Si estamos en la última página y se borra el último ítem, podríamos necesitar ajustar currentPage
                fetchProductsData(searchTerm, currentPage); 
            } catch (err) {
                toast.error(`Error al eliminar el producto: ${err.message}`);
            } finally {
                setIsConfirmModalOpen(false);
                setProductToDelete(null);
                setIsDeleting(false);
            }
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0); // Resetear a la primera página al hacer una nueva búsqueda
        fetchProductsData(searchTerm, 0); 
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber); // Esto disparará el useEffect para cargar la nueva página
    };

    let content;
    if (loading) {
        content = <div>Cargando catálogo de productos...</div>;
    } else if (errorPage && products.length === 0) { 
        content = <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Error: {errorPage}</div>;
    } else if (products.length === 0) {
        content = <div style={{ textAlign: 'center', padding: '20px' }}>No se encontraron productos {searchTerm && `para "${searchTerm}"`}.</div>;
    } else {
        content = (
            <div className="product-list-container">
                {products.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onDelete={() => requestDeleteProduct(product.id, product.name)}
                        isDeleting={isDeleting && productToDelete?.id === product.id} 
                    />
                ))}
            </div>
        );
    }
     if (errorPage && products.length > 0 && !loading) {
        toast.error(`Error al buscar: ${errorPage}`);
    }

    return (
        <div className="product-list-page">
            <h1>Catálogo de Productos</h1>
            <form onSubmit={handleSearchSubmit} className="search-form">
                 <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-button">Buscar</button>
            </form>

            {content}

            {/* Solo mostrar paginación si hay más de una página y no hay error de carga inicial */}
            {!loading && !errorPage && totalPages > 1 && (
                <PaginationControls 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="Confirmar Eliminación"
                // ... (resto de las props del modal sin cambios) ...
                message={`¿Estás seguro de que quieres eliminar el producto "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText={isDeleting ? "Eliminando..." : "Sí, Eliminar"}
                cancelText="No, Cancelar"
                isConfirmDisabled={isDeleting}
                isCancelDisabled={isDeleting}
            />
        </div>
    );
};

export default ProductListPage;