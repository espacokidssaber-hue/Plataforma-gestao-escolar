import React from 'react';
import { TermoInspecao, DocumentoExigido } from '../types';

interface TermoInspecaoFormProps {
  data: TermoInspecao;
  onDataChange: (newData: TermoInspecao) => void;
}

export const TermoInspecaoForm: React.FC<TermoInspecaoFormProps> = ({ data, onDataChange }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onDataChange({ ...data, [name]: value });
  };

  const handleDocumentoChange = (id: number, exigido: 'sim' | 'nao' | 'nao_se_aplica') => {
    const updatedDocumentos = data.documentosExigidos.map(doc =>
      doc.id === id ? { ...doc, exigido } : doc
    );
    onDataChange({ ...data, documentosExigidos: updatedDocumentos });
  };
  
  const inputClass = "block w-full px-2 py-1 border-b-2 border-dotted border-gray-400 focus:outline-none focus:border-solid focus:border-teal-500 bg-transparent";
  const labelClass = "text-sm font-medium text-gray-700";

  if (!data) return <p>Carregando formulário...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label htmlFor="data" className={labelClass}>Data:</label>
          <input type="date" id="data" name="data" value={data.data} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="horaInicio" className={labelClass}>Hora de Início:</label>
          <input type="time" id="horaInicio" name="horaInicio" value={data.horaInicio} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="horaTermino" className={labelClass}>Término:</label>
          <input type="time" id="horaTermino" name="horaTermino" value={data.horaTermino} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="nomeAgente" className={labelClass}>Nome do Agente da Inspeção do Trabalho:</label>
        <input type="text" id="nomeAgente" name="nomeAgente" value={data.nomeAgente} onChange={handleChange} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="matricula" className={labelClass}>Matrícula:</label>
          <input type="text" id="matricula" name="matricula" value={data.matricula} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="cargo" className={labelClass}>Cargo ou função:</label>
          <input type="text" id="cargo" name="cargo" value={data.cargo} onChange={handleChange} className={inputClass} />
        </div>
      </div>
      
      <div>
        <h3 className={`${labelClass} mb-2`}>Documentos exigidos:</h3>
        <div className="space-y-2">
            {data.documentosExigidos?.map(doc => (
                 <div key={doc.id} className="grid grid-cols-[1fr,auto] items-center gap-2">
                    <p className="text-sm">{doc.id} - {doc.nome}</p>
                    <div className="flex items-center space-x-3 text-sm">
                        <label className="flex items-center"><input type="radio" name={`doc-${doc.id}`} checked={doc.exigido === 'sim'} onChange={() => handleDocumentoChange(doc.id, 'sim')} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" /> <span className="ml-1">(Sim)</span></label>
                        <label className="flex items-center"><input type="radio" name={`doc-${doc.id}`} checked={doc.exigido === 'nao'} onChange={() => handleDocumentoChange(doc.id, 'nao')} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" /> <span className="ml-1">(Não)</span></label>
                        <label className="flex items-center"><input type="radio" name={`doc-${doc.id}`} checked={doc.exigido === 'nao_se_aplica'} onChange={() => handleDocumentoChange(doc.id, 'nao_se_aplica')} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" /> <span className="ml-1">(N/A)</span></label>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="outrosDocumentos" className={labelClass}>16 - E mais:</label>
        <input type="text" id="outrosDocumentos" name="outrosDocumentos" value={data.outrosDocumentos} onChange={handleChange} className={inputClass} />
      </div>

      <div>
        <label htmlFor="prazosConcedidos" className={labelClass}>Prazos concedidos:</label>
        <textarea id="prazosConcedidos" name="prazosConcedidos" value={data.prazosConcedidos} onChange={handleChange} rows={2} className={inputClass}></textarea>
      </div>
       <div>
        <label htmlFor="irregularidades" className={labelClass}>Irregularidades encontradas:</label>
        <textarea id="irregularidades" name="irregularidades" value={data.irregularidades} onChange={handleChange} rows={3} className={inputClass}></textarea>
      </div>
      <div>
        <label htmlFor="autosInfracao" className={labelClass}>Autos de Infração lavrados:</label>
        <textarea id="autosInfracao" name="autosInfracao" value={data.autosInfracao} onChange={handleChange} rows={2} className={inputClass}></textarea>
      </div>
      <div>
        <label htmlFor="orientacao" className={labelClass}>Orientação dada:</label>
        <textarea id="orientacao" name="orientacao" value={data.orientacao} onChange={handleChange} rows={2} className={inputClass}></textarea>
      </div>

      <div>
        <p className={`${labelClass} mb-2`}>Nº de Empregados em atividade:</p>
        <div className="grid grid-cols-3 gap-6">
            <div>
                <label htmlFor="numEmpregadosMaiores" className="text-sm">Maiores:</label>
                <input type="number" id="numEmpregadosMaiores" name="numEmpregadosMaiores" value={data.numEmpregadosMaiores} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label htmlFor="numEmpregadosMenores" className="text-sm">Menores:</label>
                <input type="number" id="numEmpregadosMenores" name="numEmpregadosMenores" value={data.numEmpregadosMenores} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label htmlFor="numEmpregadasMulheres" className="text-sm">Mulheres:</label>
                <input type="number" id="numEmpregadasMulheres" name="numEmpregadasMulheres" value={data.numEmpregadasMulheres} onChange={handleChange} className={inputClass} />
            </div>
        </div>
      </div>
    </div>
  );
};