
import React, { useState, useEffect, useCallback } from 'react';
import { getAllServices, deleteService } from '../services/trueServiceService';
import ServiceCard from '../components/service/ServiceCard';
import ConfirmModal from '../components/common/ConfirmModal';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import './ProductListPage.css';


const PaginationControls = ({ currentPage, totalPages, onPageChange, isDisabled }) => {
    const pageNumbers = [];
    if (totalPages <= 7) {
        for (let i = 0; i < totalPages; i++) pageNumbers.push(i);
    } else {
        pageNumbers.push(0);
        if (currentPage > 2) pageNumbers.push('...');
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages - 2, currentPage + 1);
        if (currentPage <= 2) endPage = Math.min(totalPages - 2, 3);
        if (currentPage >= totalPages - 3) startPage = Math.max(1, totalPages - 4);
        for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
        if (currentPage < totalPages - 3) pageNumbers.push('...');
        pageNumbers.push(totalPages - 1);
    }

    return (
        <div className="pagination-controls">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={isDisabled || currentPage === 0}>
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
                        disabled={isDisabled}
                    >
                        {number + 1}
                    </button>
                )
            )}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={isDisabled || currentPage === totalPages - 1 || totalPages === 0}>
                Siguiente
            </button>
        </div>
    );
};

const ServiceListPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorPage, setErrorPage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 9; 

    const { user, isAuthenticated } = useAuth();

    const fetchServicesData = useCallback(async (termToSearch = '', page = 0) => {
        try {
            setLoading(true);
            setErrorPage(null);
            const pageData = await getAllServices(termToSearch, page, PAGE_SIZE);
            setServices(pageData.content);
            setTotalPages(pageData.totalPages);
            setCurrentPage(pageData.number);

            if (termToSearch && pageData.content.length === 0) {
                toast.warn(`No se encontraron servicios para "${termToSearch}".`);
            }
        } catch (err) {
            const errorMessage = err.message || 'No se pudieron cargar los servicios.';
            setErrorPage(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        fetchServicesData(searchTerm, currentPage);
    }, [currentPage, fetchServicesData]);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const requestDeleteService = (service) => {
        const canDelete = isAuthenticated && (user?.roles?.includes('ROLE_ADMIN') || user?.username === service.ofertadoPorUsername);
        if (!canDelete) {
            toast.error("No tienes permiso para eliminar este servicio.");
            return;
        }
        if (isDeleting) return; 
        setServiceToDelete(service);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (serviceToDelete) {
            setIsDeleting(true);
            try {
                await deleteService(serviceToDelete.id);
                toast.success(`¡Servicio "${serviceToDelete.name}" eliminado con éxito!`);
                fetchServicesData(searchTerm, currentPage); 
            } catch (err) {
                toast.error(err.message || 'Error al eliminar el servicio.');
            } finally {
                setIsConfirmModalOpen(false);
                setServiceToDelete(null);
                setIsDeleting(false);
            }
        }
    };

    const handleCancelDelete = () => {
        if (isDeleting) return;
        setIsConfirmModalOpen(false);
        setServiceToDelete(null);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0); 
        fetchServicesData(searchTerm, 0); 
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    let content;
    if (loading) {
        content = <div>Cargando catálogo de servicios...</div>;
    } else if (errorPage && services.length === 0) { 
        content = <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Error: {errorPage}</div>;
    } else if (services.length === 0) {
        content = <div style={{ textAlign: 'center', padding: '20px' }}>No se encontraron servicios {searchTerm && `para "${searchTerm}"`}.</div>;
    } else {
        content = (
            <div className="product-list-container"> 
                {services.map(service => {
                    const showDeleteButton = isAuthenticated && 
                                           (user?.roles?.includes('ROLE_ADMIN') || user?.username === service.ofertadoPorUsername);
                    return (
                        <ServiceCard 
                            key={service.id} 
                            service={service} 
                            onDelete={showDeleteButton ? () => requestDeleteService(service) : null}
                            isDeleting={isDeleting && serviceToDelete?.id === service.id} 
                        />
                    );
                })}
            </div>
        );
    }
    if (errorPage && services.length > 0 && !loading) {
        toast.error(`Error al actualizar la lista: ${errorPage}`);
    }

    return (
        <div className="product-list-page"> 
            <h1>Catálogo de Servicios</h1>
            <form onSubmit={handleSearchSubmit} className="search-form">
                 <input
                    type="text"
                    placeholder="Buscar servicios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-button">Buscar</button>
            </form>
            
            {content}

            {!loading && !errorPage && totalPages > 1 && (
                <PaginationControls 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isDisabled={loading || isDeleting}
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar el servicio "${serviceToDelete?.name}"?`}
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

export default ServiceListPage;