import { getModulosPreco } from '@/app/actions/precos';
import { requireAdmin } from '@/app/actions/admin';
import PrecosClient from './PrecosClient';

/**
 * Página de Gestão de Preços do Painel Administrativo.
 * Busca os módulos no servidor e passa para o componente cliente interativo.
 */
export default async function PrecosPage() {
  await requireAdmin();
  const modulos = await getModulosPreco();

  return <PrecosClient modulos={modulos} />;
}
