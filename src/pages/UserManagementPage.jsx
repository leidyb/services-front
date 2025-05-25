import React, { useState, useEffect } from 'react';
import { getAllUsersAdmin, updateUserRolesAdmin } from '../services/adminService';
import { toast } from 'react-toastify'; // Importar toast
import './UserManagementPage.css'; 

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorPage, setErrorPage] = useState(null); // Para errores de carga de página

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [rolesInput, setRolesInput] = useState('');
    // const [editError, setEditError] = useState(''); // Ya no se usa
    // const [editSuccess, setEditSuccess] = useState(''); // Ya no se usa
    const [isSavingRoles, setIsSavingRoles] = useState(false);


    const fetchUsers = async () => {
        try {
            setLoading(true);
            setErrorPage(null); 
            const data = await getAllUsersAdmin();
            setUsers(data);
        } catch (err) {
            setErrorPage(err.message || 'No se pudieron cargar los usuarios.');
            toast.error(err.message || 'No se pudieron cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (userToEdit) => {
        setEditingUser(userToEdit);
        setRolesInput(userToEdit.roles || ''); 
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setRolesInput('');
    };

    const handleRolesInputChange = (event) => {
        setRolesInput(event.target.value);
    };

    const handleSaveRoles = async () => {
        if (!editingUser) return;
        setIsSavingRoles(true);

        const rolesArray = rolesInput.split(',').map(role => role.trim()).filter(role => role.length > 0);

        try {
            await updateUserRolesAdmin(editingUser.username, { roles: rolesArray });
            toast.success('¡Roles actualizados con éxito!');
            fetchUsers(); 
            handleCloseModal(); // Cerramos el modal inmediatamente después del éxito
        } catch (err) {
            toast.error(err.message || 'Error al actualizar los roles.');
        } finally {
            setIsSavingRoles(false);
        }
    };

    if (loading) return <div>Cargando usuarios...</div>;
    // Mostrar error de página solo si no hay usuarios (ej. fallo inicial de carga)
    if (errorPage && users.length === 0) return <div style={{ color: 'red', padding: '20px' }}>Error: {errorPage}</div>;


    return (
        <div className="user-management-page">
            <h1>Gestión de Usuarios</h1>
            {users.length === 0 && !loading && !errorPage ? ( // Ajuste en condición
                <p>No hay usuarios para mostrar.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Roles</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.roles}</td>
                                <td>
                                    <button onClick={() => handleOpenModal(user)} className="edit-roles-button">
                                        Editar Roles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {isModalOpen && editingUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Editar Roles para: {editingUser.username}</h2>
                        <div className="form-group">
                            <label htmlFor="roles">Roles (separados por coma, ej: ROLE_USER,ROLE_ADMIN)</label>
                            <input
                                type="text"
                                id="roles"
                                value={rolesInput}
                                onChange={handleRolesInputChange}
                                placeholder="ROLE_USER,ROLE_ADMIN"
                                disabled={isSavingRoles}
                            />
                        </div>
                        {/* Los mensajes de error/éxito del modal ahora son toasts */}
                        <div className="modal-actions">
                            <button onClick={handleSaveRoles} className="modal-button save" disabled={isSavingRoles}>
                                {isSavingRoles ? 'Guardando...' : 'Guardar Roles'}
                            </button>
                            <button onClick={handleCloseModal} className="modal-button cancel" disabled={isSavingRoles}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;