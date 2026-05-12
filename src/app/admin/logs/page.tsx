import { getSystemLogs } from '@/app/actions/admin';
import { Activity, AlertTriangle, Info, XCircle, Clock, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
  const logs = await getSystemLogs();

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'WARNING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <XCircle className="w-4 h-4" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="text-primary w-8 h-8" />
          Logs do Sistema
        </h1>
        <p className="text-gray-400 mt-2">Monitoramento de eventos, erros e atividades críticas da plataforma.</p>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="glass-panel border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${getLevelStyles(log.level)}`}>
                  {getLevelIcon(log.level)}
                  {log.level}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(log.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="text-[10px] text-gray-600 font-mono select-all bg-white/5 px-2 py-1 rounded">
                ID: {log.id}
              </div>
            </div>
            
            <h3 className="text-white font-medium mb-3 leading-relaxed">{log.message}</h3>

            {log.context && (
              <div className="mt-4">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Contexto Técnico
                </p>
                <pre className="bg-black/50 p-4 rounded-xl text-[11px] text-blue-400/80 font-mono overflow-x-auto border border-white/5">
                  {JSON.stringify(log.context, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}

        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 glass-panel rounded-3xl border-dashed border-2 border-white/5">
            <Shield className="w-16 h-16 text-gray-700 mb-4" />
            <p className="text-gray-500 italic">Nenhum evento registrado no log.</p>
          </div>
        )}
      </div>
    </div>
  );
}
