
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, School } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

const formatCNPJ = (v: string) => v.replace(/\D/g, "").substring(0, 14).replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
const formatPhone = (v: string) => v.replace(/\D/g, "").substring(0, 11).replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2");
const formatCEP = (v: string) => v.replace(/\D/g, "").substring(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const initialFormState = { name: '', cnpj: '', cep: '', address: '', addressNumber: '', email: '', phone: '' };

const EditSchoolModal: React.FC<{ isOpen: boolean; onClose: () => void; school: School; onUpdateSchool: (id: string, data: any, logo: File | null) => Promise<void> }> = ({ isOpen, onClose, school, onUpdateSchool }) => {
    const [formData, setFormData] = useState({ ...initialFormState, ...school });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(school.logoUrl || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData({ ...initialFormState, ...school });
        setLogoPreview(school.logoUrl || null);
    }, [school]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { id, ...dataToUpdate } = formData as any;
            await onUpdateSchool(school.id, dataToUpdate, logoFile);
            onClose();
        } catch (error: any) { 
            console.error(error); 
            alert(error.message || "Erro ao atualizar."); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formatted = value;
        if (name === 'cnpj') formatted = formatCNPJ(value);
        if (name === 'phone') formatted = formatPhone(value);
        if (name === 'cep') formatted = formatCEP(value);
        setFormData(prev => ({ ...prev, [name]: formatted }));
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                setFormData(prev => ({ ...prev, address }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar ${school.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        {logoPreview ? <img src={logoPreview} className="h-24 w-24 rounded-full object-cover border" alt="Logo" /> : <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center"><PhotoIcon className="w-8 h-8 text-gray-400" /></div>}
                        <button type="button" onClick={() => logoInputRef.current?.click()} className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow border"><PencilIcon className="w-4 h-4 text-gray-600" /></button>
                        <input ref={logoInputRef} type="file" className="hidden" onChange={handleLogoChange} accept="image/*" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div><label className="text-sm font-medium">Nome</label><input name="name" value={formData.name} onChange={handleChange} className="w-full border rounded p-2 text-sm" required /></div>
                    <div><label className="text-sm font-medium">CNPJ</label><input name="cnpj" value={formData.cnpj} onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1"><label className="text-sm font-medium">CEP</label><input name="cep" value={formData.cep || ''} onChange={handleChange} onBlur={handleCepBlur} className="w-full border rounded p-2 text-sm" placeholder="00000-000" /></div>
                        <div className="col-span-2"><label className="text-sm font-medium">Endereço</label><input name="address" value={formData.address} onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                        <div className="col-span-1"><label className="text-sm font-medium">Número</label><input name="addressNumber" value={formData.addressNumber || ''} onChange={handleChange} className="w-full border rounded p-2 text-sm" placeholder="Nº" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">E-mail</label><input name="email" value={formData.email} onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                        <div><label className="text-sm font-medium">Telefone</label><input name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                    </div>
                </div>
                <div className="flex justify-end pt-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : "Salvar"}</Button></div>
            </form>
        </Modal>
    );
};

export const SettingsPage: React.FC<{
    user: User;
    users: User[];
    schools: School[];
    onAddUser: (u: any) => Promise<void>;
    onUpdatePassword: (id: string, p: string) => Promise<void>;
    onUpdateSchool: (id: string, data: any, logo: File | null) => Promise<void>;
    onCreateSchool: (data: any, logo: File | null) => Promise<void>;
    onDeleteSchool: (id: string) => Promise<void>;
}> = ({ user, users, schools, onAddUser, onUpdatePassword, onUpdateSchool, onCreateSchool, onDeleteSchool }) => {
    const [newUser, setNewUser] = useState({ username: '', password: '', role: UserRole.SECRETARIA, schoolId: '' });
    const [newSchool, setNewSchool] = useState(initialFormState);
    const [schoolLogo, setSchoolLogo] = useState<File | null>(null);
    const [schoolLogoPreview, setSchoolLogoPreview] = useState<string | null>(null);
    const [editingSchool, setEditingSchool] = useState<School | null>(null);
    const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
    const [userPasswordReset, setUserPasswordReset] = useState<{ id: string, name: string } | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [isSubmittingUser, setIsSubmittingUser] = useState(false);
    const [isSubmittingSchool, setIsSubmittingSchool] = useState(false);
    const [isDeletingSchool, setIsDeletingSchool] = useState(false);
    const [createSchoolMessage, setCreateSchoolMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    
    const schoolLogoInputRef = useRef<HTMLInputElement>(null);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingUser(true);
        try {
            await onAddUser({ ...newUser, password_plaintext: newUser.password });
            setNewUser({ username: '', password: '', role: UserRole.SECRETARIA, schoolId: '' });
            alert("Usuário criado!");
        } catch (e: any) { alert(e.message); } finally { setIsSubmittingUser(false); }
    };

    const handleNewSchoolCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                setNewSchool(prev => ({ ...prev, address }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    const onSubmitNewSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingSchool(true);
        setCreateSchoolMessage(null);
        
        try {
            if (!newSchool.name) throw new Error("O nome da escola é obrigatório.");
            
            await onCreateSchool(newSchool, schoolLogo);
            
            setNewSchool(initialFormState);
            setSchoolLogo(null);
            setSchoolLogoPreview(null);
            if (schoolLogoInputRef.current) schoolLogoInputRef.current.value = '';
            setCreateSchoolMessage({ type: 'success', text: "Escola criada com sucesso!" });
            setTimeout(() => setCreateSchoolMessage(null), 5000);
        } catch (e: any) { 
            console.error(e); 
            setCreateSchoolMessage({ type: 'error', text: e.message || "Erro ao criar escola." });
        } finally { 
            setIsSubmittingSchool(false); 
        }
    };

    const handleDeleteConfirm = async () => {
        if (!schoolToDelete) return;
        setIsDeletingSchool(true);
        try {
            await onDeleteSchool(schoolToDelete.id);
            setSchoolToDelete(null);
        } catch (e: any) {
            console.error("Erro ao excluir:", e);
            alert(e.message || "Erro ao excluir escola. Tente novamente.");
        } finally {
            setIsDeletingSchool(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!userPasswordReset || !newPassword) return;
        try {
            await onUpdatePassword(userPasswordReset.id, newPassword);
            setUserPasswordReset(null);
            setNewPassword('');
            alert("Senha alterada!");
        } catch (e: any) { alert(e.message); }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
            
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Gerenciar Usuários</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <h3 className="font-semibold text-sm text-gray-600">Novo Usuário</h3>
                        <input placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full border p-2 rounded text-sm" required />
                        <input type="password" placeholder="Senha" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border p-2 rounded text-sm" required />
                        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full border p-2 rounded text-sm">
                            {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {user.role === UserRole.SUPER_ADMINISTRADOR && (
                            <select value={newUser.schoolId} onChange={e => setNewUser({...newUser, schoolId: e.target.value})} className="w-full border p-2 rounded text-sm" required={newUser.role !== UserRole.SUPER_ADMINISTRADOR}>
                                <option value="">Selecione a Escola...</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        )}
                        <Button type="submit" className="w-full" disabled={isSubmittingUser}>{isSubmittingUser ? <SpinnerIcon className="w-4 h-4"/> : "Criar Usuário"}</Button>
                    </form>
                    <div className="lg:col-span-2">
                        <h3 className="font-semibold text-sm text-gray-600 mb-2">Usuários Cadastrados</h3>
                        <div className="border rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">User</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Role</th><th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Ações</th></tr></thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td className="px-4 py-2 text-sm">{u.username}</td>
                                            <td className="px-4 py-2 text-sm">{u.role}</td>
                                            <td className="px-4 py-2 text-right text-sm">
                                                <button onClick={() => setUserPasswordReset({ id: u.id, name: u.username })} className="text-teal-600 hover:underline">Senha</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {user.role === UserRole.SUPER_ADMINISTRADOR && (
                <div className="bg-white p-6 rounded-lg shadow space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Gestão de Instituições</h2>
                    
                    {/* Inline School Form */}
                    <form onSubmit={onSubmitNewSchool} className="space-y-4 bg-gray-50 p-4 rounded border">
                        <h3 className="font-semibold text-gray-700">Nova Instituição</h3>
                        <div className="flex gap-4 items-start">
                            <div className="w-24 h-24 bg-white border rounded flex items-center justify-center cursor-pointer relative" onClick={() => schoolLogoInputRef.current?.click()}>
                                {schoolLogoPreview ? <img src={schoolLogoPreview} className="w-full h-full object-cover rounded" alt="Logo Preview" /> : <PhotoIcon className="w-8 h-8 text-gray-400" />}
                                <input type="file" ref={schoolLogoInputRef} className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) { setSchoolLogo(e.target.files[0]); setSchoolLogoPreview(URL.createObjectURL(e.target.files[0])); } }} />
                            </div>
                            <div className="flex-1 grid grid-cols-12 gap-4">
                                <div className="col-span-6">
                                    <input placeholder="Nome da Escola" value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} className="w-full border p-2 rounded text-sm" required disabled={isSubmittingSchool} />
                                </div>
                                <div className="col-span-6">
                                    <input placeholder="CNPJ" value={newSchool.cnpj} onChange={e => setNewSchool({...newSchool, cnpj: formatCNPJ(e.target.value)})} className="w-full border p-2 rounded text-sm" disabled={isSubmittingSchool} />
                                </div>
                                <div className="col-span-3">
                                    <input placeholder="CEP" value={newSchool.cep || ''} onChange={e => setNewSchool({...newSchool, cep: formatCEP(e.target.value)})} onBlur={handleNewSchoolCepBlur} className="w-full border p-2 rounded text-sm" disabled={isSubmittingSchool} />
                                </div>
                                <div className="col-span-7">
                                    <input placeholder="Endereço" value={newSchool.address} onChange={e => setNewSchool({...newSchool, address: e.target.value})} className="w-full border p-2 rounded text-sm" disabled={isSubmittingSchool} />
                                </div>
                                <div className="col-span-2">
                                    <input placeholder="Nº" value={newSchool.addressNumber || ''} onChange={e => setNewSchool({...newSchool, addressNumber: e.target.value})} className="w-full border p-2 rounded text-sm" disabled={isSubmittingSchool} />
                                </div>
                            </div>
                        </div>
                        {createSchoolMessage && (
                            <div className={`p-2 text-sm rounded ${createSchoolMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {createSchoolMessage.text}
                            </div>
                        )}
                        <div className="text-right"><Button type="submit" disabled={isSubmittingSchool}>{isSubmittingSchool ? <SpinnerIcon className="w-4 h-4"/> : "Cadastrar Escola"}</Button></div>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schools.map(school => (
                            <div key={school.id} className="border rounded-lg p-4 flex items-center space-x-4 bg-white hover:shadow-md transition">
                                <img src={school.logoUrl || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded object-cover bg-gray-100" alt="School Logo" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{school.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{school.cnpj || 'Sem CNPJ'}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => setEditingSchool(school)} className="text-gray-400 hover:text-teal-600"><PencilIcon className="w-5 h-5" /></button>
                                    <button onClick={() => setSchoolToDelete(school)} className="text-gray-400 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {user.role === UserRole.ADMINISTRADOR && user.schoolId && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">Minha Escola</h2>
                    {schools.filter(s => s.id === user.schoolId).map(s => (
                        <div key={s.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {s.logoUrl && <img src={s.logoUrl} className="w-16 h-16 rounded object-cover" alt="My School Logo" />}
                                <div>
                                    <h3 className="font-bold text-lg">{s.name}</h3>
                                    <p className="text-gray-500">{s.address}</p>
                                </div>
                            </div>
                            <Button onClick={() => setEditingSchool(s)}><PencilIcon className="w-4 h-4 mr-2"/> Editar Dados</Button>
                        </div>
                    ))}
                </div>
            )}

            {editingSchool && <EditSchoolModal isOpen={!!editingSchool} onClose={() => setEditingSchool(null)} school={editingSchool} onUpdateSchool={onUpdateSchool} />}
            
            {userPasswordReset && (
                <Modal isOpen={!!userPasswordReset} onClose={() => setUserPasswordReset(null)} title={`Nova Senha: ${userPasswordReset.name}`}>
                    <div className="space-y-4">
                        <input type="password" placeholder="Nova Senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border p-2 rounded" />
                        <div className="flex justify-end"><Button onClick={handlePasswordReset}>Salvar</Button></div>
                    </div>
                </Modal>
            )}

            {schoolToDelete && (
                <Modal isOpen={!!schoolToDelete} onClose={() => setSchoolToDelete(null)} title="Confirmar Exclusão">
                    <div className="space-y-4">
                        <p>Você tem certeza que deseja excluir a instituição <b>{schoolToDelete.name}</b>?</p>
                        <div className="bg-red-50 p-3 rounded border border-red-200 text-sm text-red-800">
                            <b>Atenção:</b> Esta ação não pode ser desfeita.
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setSchoolToDelete(null)} disabled={isDeletingSchool}>Cancelar</Button>
                            <Button type="button" className="!bg-red-600 hover:!bg-red-700" onClick={handleDeleteConfirm} disabled={isDeletingSchool}>
                                {isDeletingSchool ? <SpinnerIcon className="w-4 h-4 mr-2"/> : null}
                                {isDeletingSchool ? "Excluindo..." : "Excluir Definitivamente"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
