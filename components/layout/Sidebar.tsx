
// Sidebar Component - v3.14.0
import React, { useState, useEffect } from 'react';
import { type User, UserRole, type School } from '../../types';
import { HomeIcon } from '../icons/HomeIcon';
import { UserIcon } from '../icons/UserIcon';
import { UserPlusIcon } from '../icons/UserPlusIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { ChatBubbleLeftRightIcon } from '../icons/ChatBubbleLeftRightIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { PencilSquareIcon } from '../icons/PencilSquareIcon';
import { FolderIcon } from '../icons/FolderIcon';
import { FolderOpenIcon } from '../icons/FolderOpenIcon';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';
import { Cog6ToothIcon } from '../icons/Cog6ToothIcon';
import { SchoolLogoIcon } from '../icons/SchoolLogoIcon';
import { MegaphoneIcon } from '../icons/MegaphoneIcon';
import { ArrowLeftOnRectangleIcon } from '../icons/ArrowLeftOnRectangleIcon';
import { XMarkIcon } from '../icons/XMarkIcon';
import { ClipboardDocumentListIcon } from '../icons/ClipboardDocumentListIcon';
import { CalendarDaysIcon } from '../icons/CalendarDaysIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { PrinterIcon } from '../icons/PrinterIcon';
import { RectangleStackIcon } from '../icons/RectangleStackIcon';
import { RectangleGroupIcon } from '../icons/RectangleGroupIcon';
import { ClipboardDocumentCheckIcon } from '../icons/ClipboardDocumentCheckIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { TicketIcon } from '../icons/TicketIcon';
import { CubeIcon } from '../icons/CubeIcon';
import { PresentationChartLineIcon } from '../icons/PresentationChartLineIcon';
import { HandRaisedIcon } from '../icons/HandRaisedIcon';


const allMenuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'marketing', name: 'Marketing', icon: MegaphoneIcon },
    { id: 'matriculas', name: 'Matrículas', icon: UserPlusIcon },
    { id: 'nova-matricula', name: 'Nova Matrícula', icon: UserPlusIcon },
    { id: 'gestao-matriculas', name: 'Gestão de Matrículas', icon: UsersIcon },
    { id: 'alunos', name: 'Alunos', icon: UserIcon },
    { id: 'funcionarios', name: 'Funcionários', icon: BriefcaseIcon },
    { id: 'academico', name: 'Acadêmico', icon: AcademicCapIcon },
    { id: 'planejamento', name: 'Planejamento', icon: PresentationChartLineIcon },
    { id: 'frequencia', name: 'Frequência Escolar', icon: HandRaisedIcon },
    { id: 'calendario', name: 'Calendário', icon: CalendarDaysIcon },
    { id: 'eventos-escolares', name: 'Eventos Escolares', icon: TicketIcon },
    { id: 'notas', name: 'Notas', icon: ClipboardDocumentListIcon },
    { id: 'diario', name: 'Diário de Classe', icon: BookOpenIcon },
    { id: 'horarios', name: 'Horários', icon: RectangleStackIcon },
    { id: 'turmas', name: 'Turmas', icon: RectangleGroupIcon },
    { id: 'disciplinas', name: 'Disciplinas', icon: ClipboardDocumentCheckIcon },
    { id: 'atividades-impressao', name: 'Atividades p/ Impressão', icon: PrinterIcon },
    { id: 'financeiro', name: 'Financeiro', icon: CurrencyDollarIcon },
    { id: 'comunicacao', name: 'Comunicação', icon: ChatBubbleLeftRightIcon },
    { id: 'relatorios', name: 'Relatórios', icon: ChartBarIcon },
    { id: 'declaracoes', name: 'Declarações', icon: DocumentTextIcon },
    { id: 'atas', name: 'Atas', icon: BookOpenIcon },
    { id: 'assinaturas', name: 'Assinaturas e Contratos', icon: PencilSquareIcon },
    { id: 'estoque', name: 'Estoque de Materiais', icon: CubeIcon },
    { id: 'arquivos', name: 'Escrituração Escolar', icon: FolderIcon },
    { id: 'livros', name: 'Livros', icon: BookOpenIcon },
    { id: 'arquivo-ativo', name: 'Arquivo Ativo', icon: FolderOpenIcon },
    { id: 'arquivo-morto', name: 'Arquivo Morto', icon: ArchiveBoxIcon },
    { id: 'inspecao-escolar', name: 'Livro de Visita Inspetor', icon: DocumentTextIcon },
    { id: 'configuracoes', name: 'Configurações', icon: Cog6ToothIcon },
];

const PAGE_PERMISSIONS: { [key in UserRole]: string[] } = {
  [UserRole.SUPER_ADMINISTRADOR]: allMenuItems.map(item => item.id),
  [UserRole.ADMINISTRADOR]: allMenuItems.map(item => item.id),
  [UserRole.SECRETARIA]: ['dashboard', 'marketing', 'nova-matricula', 'gestao-matriculas', 'alunos', 'academico', 'planejamento', 'frequencia', 'calendario', 'eventos-escolares', 'notas', 'diario', 'atividades-impressao', 'horarios', 'turmas', 'disciplinas', 'comunicacao', 'relatorios', 'declaracoes', 'atas', 'assinaturas', 'estoque', 'arquivos', 'livros', 'arquivo-ativo', 'arquivo-morto', 'inspecao-escolar'],
  [UserRole.EDUCADORA]: ['dashboard', 'alunos', 'academico', 'planejamento', 'frequencia', 'calendario', 'eventos-escolares', 'notas', 'diario', 'atividades-impressao', 'horarios', 'comunicacao', 'estoque', 'arquivos', 'livros', 'arquivo-ativo', 'arquivo-morto', 'inspecao-escolar'],
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface SidebarProps {
    user: User;
    activePage: string;
    onNavigate: (pageId: string) => void;
    onLogout: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    schools: School[];
    superAdminSchoolFilter: string;
    setSuperAdminSchoolFilter: (schoolId: string) => void;
    selectedYear: number;
    setSelectedYear: (year: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activePage, onNavigate, onLogout, isSidebarOpen, setIsSidebarOpen, schools, superAdminSchoolFilter, setSuperAdminSchoolFilter, selectedYear, setSelectedYear }) => {
    
    const [isMatriculasOpen, setIsMatriculasOpen] = useState(false);
    const matriculasSubmenuIds = ['nova-matricula', 'gestao-matriculas'];
    const isMatriculasSectionActive = matriculasSubmenuIds.includes(activePage);

    const [isAcademicOpen, setIsAcademicOpen] = useState(false);
    const academicSubmenuIds = ['academico', 'planejamento', 'frequencia', 'calendario', 'notas', 'diario', 'atividades-impressao', 'horarios', 'turmas', 'disciplinas'];
    const isAcademicSectionActive = academicSubmenuIds.includes(activePage);
    
    const [isEscrituracaoOpen, setIsEscrituracaoOpen] = useState(false);
    const escrituracaoSubmenuIds = ['livros', 'arquivo-ativo', 'arquivo-morto', 'inspecao-escolar'];
    const isEscrituracaoSectionActive = ['arquivos', ...escrituracaoSubmenuIds].includes(activePage);

    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({length: 6}, (_, i) => currentYear - 3 + i);

    useEffect(() => {
        if (isMatriculasSectionActive) {
            setIsMatriculasOpen(true);
        }
    }, [isMatriculasSectionActive]);
    
    useEffect(() => {
        if (isAcademicSectionActive) {
            setIsAcademicOpen(true);
        }
    }, [isAcademicSectionActive]);
    
    useEffect(() => {
        if (isEscrituracaoSectionActive) {
            setIsEscrituracaoOpen(true);
        }
    }, [isEscrituracaoSectionActive]);

    const menuItems = allMenuItems.filter(item => PAGE_PERMISSIONS[user.role].includes(item.id));
    
    const matriculasChildren = menuItems.filter(item => matriculasSubmenuIds.includes(item.id));
    const academicChildren = menuItems.filter(item => academicSubmenuIds.slice(1).includes(item.id));
    const escrituracaoChildren = menuItems.filter(item => escrituracaoSubmenuIds.includes(item.id));
    
    const mainMenuItems = menuItems.filter(item => 
        !matriculasSubmenuIds.includes(item.id) && 
        !academicSubmenuIds.slice(1).includes(item.id) && 
        !escrituracaoSubmenuIds.includes(item.id)
    );
    
    const schoolNameForUser = user.schoolId ? schools.find(s => s.id === user.schoolId)?.name || user.schoolId : null;

    const sidebarContent = (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
            <div className="flex h-20 shrink-0 items-center gap-3 px-2 border-b border-gray-200 -mx-6">
                 <SchoolLogoIcon className="w-9 h-9" />
                <div>
                    <h1 className="text-md font-bold text-gray-800">
                      {user.role === UserRole.SUPER_ADMINISTRADOR 
                        ? 'Plataforma Escolar'
                        : (schoolNameForUser || 'Plataforma Escolar')
                      }
                    </h1>
                    <p className="text-xs text-gray-500">
                      {user.role}
                    </p>
                </div>
            </div>

            <div className="px-1 pt-2">
                <label htmlFor="year-select" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Ano Letivo
                </label>
                <div className="relative">
                    <select
                        id="year-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 bg-gray-50 text-gray-900 font-medium"
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <nav className="flex flex-1 flex-col justify-between mt-2">
                <div> 
                    {user.role === UserRole.SUPER_ADMINISTRADOR && (
                        <div className="mb-4">
                            <label htmlFor="school-filter" className="px-1 text-xs font-semibold text-gray-500">VISUALIZANDO</label>
                            <select
                                id="school-filter"
                                name="school-filter"
                                className="mt-1 block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 shadow-sm"
                                value={superAdminSchoolFilter}
                                onChange={(e) => setSuperAdminSchoolFilter(e.target.value)}
                            >
                                <option value="all">Todas as Escolas</option>
                                {schools.map(school => (
                                    <option key={school.id} value={school.id}>{school.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="space-y-1">
                        {mainMenuItems.map((item) => {
                            if (item.id === 'matriculas') {
                                return (
                                    <div key="matriculas-menu">
                                        <button
                                            type="button"
                                            onClick={() => setIsMatriculasOpen(!isMatriculasOpen)}
                                            className={classNames(
                                                isMatriculasSectionActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                                'group flex items-center w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
                                            )}
                                        >
                                            <item.icon
                                                className={classNames(
                                                    isMatriculasSectionActive ? 'text-teal-600' : 'text-teal-500 group-hover:text-teal-600',
                                                    'mr-3 flex-shrink-0 h-6 w-6 transition-colors'
                                                )}
                                                aria-hidden="true"
                                            />
                                            <span className="flex-1" onClick={(e) => { e.stopPropagation(); onNavigate('gestao-matriculas'); }}>{item.name}</span>
                                            <ChevronDownIcon className={classNames(
                                                'h-5 w-5 transform transition-transform duration-200',
                                                isMatriculasOpen ? 'rotate-180' : ''
                                            )} />
                                        </button>
                                        {isMatriculasOpen && matriculasChildren.length > 0 && (
                                            <div className="mt-1 pl-6 space-y-1">
                                                {matriculasChildren.map(child => {
                                                    const isChildCurrent = child.id === activePage;
                                                    return (
                                                        <button
                                                            key={child.id}
                                                            type="button"
                                                            onClick={() => onNavigate(child.id)}
                                                            className={classNames(
                                                                isChildCurrent ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                                                'group flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors'
                                                            )}
                                                        >
                                                            <child.icon
                                                                className={classNames(
                                                                    isChildCurrent ? 'text-teal-600' : 'text-teal-500 group-hover:text-teal-600',
                                                                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                                                                )}
                                                                aria-hidden="true"
                                                            />
                                                            {child.name}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            if (item.id === 'academico') {
                                return (
                                    <div key="academico-menu">
                                        <button
                                            type="button"
                                            onClick={() => setIsAcademicOpen(!isAcademicOpen)}
                                            className={classNames(
                                                isAcademicSectionActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                                'group flex items-center w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
                                            )}
                                        >
                                            <item.icon
                                                className={classNames(
                                                    isAcademicSectionActive ? 'text-teal-600' : 'text-teal-500 group-hover:text-teal-600',
                                                    'mr-3 flex-shrink-0 h-6 w-6 transition-colors'
                                                )}
                                                aria-hidden="true"
                                            />
                                            <span className="flex-1" onClick={(e) => { e.stopPropagation(); onNavigate(item.id); }}>{item.name}</span>
                                            <ChevronDownIcon className={classNames(
                                                'h-5 w-5 transform transition-transform duration-200',
                                                isAcademicOpen ? 'rotate-180' : ''
                                            )} />
                                        </button>
                                        {isAcademicOpen && academicChildren.length > 0 && (
                                            <div className="mt-1 pl-6 space-y-1">
                                                <button
                                                    key="academico-main"
                                                    type="button"
                                                    onClick={() => onNavigate('academico')}
                                                    className={classNames(
                                                        activePage === 'academico' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                                        'group flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors'
                                                    )}
                                                >
                                                    <AcademicCapIcon className={classNames(
                                                        activePage === 'academico' ? 'text-teal-600' : 'text-teal-500 group-hover:text-teal-600',
                                                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                                                    )} /> Visão Geral
                                                </button>
                                                {academicChildren.map(child => {
                                                    const isChildCurrent = child.id === activePage;
                                                    return (
                                                        <button
                                                            key={child.id}
                                                            type="button"
                                                            onClick={() => onNavigate(child.id)}
                                                            className={classNames(
                                                                isChildCurrent ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                                                'group flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors'
                                                            )}
                                                        >
                                                            <child.icon
                                                                className={classNames(
                                                                    isChildCurrent ? 'text-teal-600' : 'text-teal-500 group-hover:text-teal-600',
                                                                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                                                                )}
                                                                aria-hidden="true"
                                                            />
                                                            {child.name}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            if (item.id === 'arquivos') {
                                return (
                                    <div key="arquivos-menu">
                                        <button
                                            type="button"
                                            onClick={() => setIsEscrituracaoOpen(!isEscrituracaoOpen)}
                                            className={classNames(
                                                isEscrituracaoSectionActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                                'group flex items-center w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
                                            )}
                                        >
                                            <item.icon
                                                className={classNames(
                                                    isEscrituracaoSectionActive ? 'text-teal-600' : 'text-teal-500 group-hover:text-teal-600',
                                                    'mr-3 flex-shrink-0 h-6 w-6 transition-colors'
                                                )}
                                                aria-hidden="true"
                                            />
                                            <span className="flex-1">{item.name}</span>
                                            <ChevronDownIcon className={classNames(
                                                'h-5 w-5 transform transition-transform duration-200',
                                                isEscrituracaoOpen ? 'rotate-180' : ''
                                            )} />
                                        </button>
                                        {isEscrituracaoOpen && escrituracaoChildren.length > 0 && (
                                            <div className="mt-1 pl-6 space-y-1">
                                                {escrituracaoChildren.map(child => {
                                                    const isChildCurrent = child.id === activePage;
                                                    return (
                                                        <button
                                                            key={child.id}
                                                            type="button"
                                                            onClick={() => onNavigate(child.id)}
                                                            className={classNames(
                                                                isChildCurrent ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                                                'group flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors'
                                                            )}
                                                        >
                                                            <child.icon
                                                                className={classNames(
                                                                    isChildCurrent ? 'text-teal-600' : 'text-teal-500 group-hover:text-teal-600',
                                                                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                                                                )}
                                                                aria-hidden="true"
                                                            />
                                                            {child.name}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onNavigate(item.id)}
                                    className={classNames(
                                        activePage === item.id ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                        'group flex items-center w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
                                    )}
                                >
                                    <item.icon
                                        className={classNames(
                                            activePage === item.id ? 'text-teal-600' : 'text-teal-500 group-hover:text-teal-600',
                                            'mr-3 flex-shrink-0 h-6 w-6 transition-colors'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-2">
                    <button
                        type="button"
                        onClick={onLogout}
                        className="group flex items-center w-full text-left px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                        <ArrowLeftOnRectangleIcon
                            className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-red-500 transition-colors"
                            aria-hidden="true"
                        />
                        Sair
                    </button>
                </div>
            </nav>
        </div>
    );

    return (
        <>
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col border-r border-gray-200">
                {sidebarContent}
            </div>

            {isSidebarOpen && (
                <div className="relative z-50 lg:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-900/80" aria-hidden="true" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="fixed inset-0 flex">
                        <div className="relative mr-16 flex w-full max-w-xs flex-1">
                            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                <button type="button" className="-m-2.5 p-2.5" onClick={() => setIsSidebarOpen(false)}>
                                    <span className="sr-only">Fechar menu</span>
                                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                </button>
                            </div>
                            {sidebarContent}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
