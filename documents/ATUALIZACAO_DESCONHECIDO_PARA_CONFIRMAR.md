# Guia de Replicação: Substituir "Desconhecido" por "Resultado após confirmar e consultar"

Este guia contém as instruções completas para aplicar a melhoria de conversão nos sistemas clones/cópia do **Detetive Buscas / ConsultaALL**.

---

## 🎯 Objetivo Comercial

Nas pesquisas que retornam múltiplos candidatos ou prévias antes do pagamento (por exemplo, busca por **Nome**, **Endereços** ou **Processos Judiciais**), a API externa frequentemente retorna a cidade ou estado como nulo, `"XX"` ou literalmente `"DESCONHECIDO"`.

### Antes (Problema de Conversão)
O usuário visualizava nos cards de prévia:
- **Localização:** Desconhecida - XX
- **Mãe:** Não informado / Desconhecido

Isso gerava a falsa impressão de que a plataforma não possuía as informações da pessoa pesquisada, levando o usuário a **desistir de clicar no botão "Confirmar e Consultar"** para não "perder saldo".

### Depois (Aumento de Cliques e Vendas)
- **Localização:** Resultado após confirmar e consultar
- **Mãe:** Resultado após confirmar e consultar

O usuário compreende imediatamente que o dado está protegido na prévia gratuita e será **liberado e entregue completo assim que ele confirmar e pagar a consulta**.

---

## 📦 1. Criar o Utilitário Centralizado

Crie o arquivo `src/utils/candidate-helpers.ts` com o código abaixo:

```typescript
/**
 * Utilitários para formatação e exibição dos cards de prévia de candidatos
 * Substitui termos negativos como "Desconhecido" ou "Não informado" por chamadas convidativas
 * orientando o usuário a prosseguir com a confirmação da consulta.
 */

export const MENSAGEM_LIBERACAO = 'Resultado após confirmar e consultar';

/**
 * Verifica se um valor textual é considerado desconhecido, vazio ou indisponível
 */
export function isFieldUnknown(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return true;
  const clean = val.trim().toLowerCase();
  return (
    clean === '' ||
    clean === 'xx' ||
    clean === 'n/i' ||
    clean.includes('desconhecid') ||
    clean.includes('indispon') ||
    clean.includes('nao informado') ||
    clean.includes('não informado') ||
    clean.includes('nao consta') ||
    clean.includes('não consta')
  );
}

/**
 * Formata a localização do candidato (Cidade - UF) de forma comercialmente atrativa
 */
export function formatCandidateLocation(city?: string | null, state?: string | null): { text: string; isPlaceholder: boolean } {
  const cityUnknown = isFieldUnknown(city);
  const stateUnknown = isFieldUnknown(state);

  if (cityUnknown && stateUnknown) {
    return { text: MENSAGEM_LIBERACAO, isPlaceholder: true };
  }

  if (cityUnknown) {
    return { text: `${MENSAGEM_LIBERACAO} (${state})`, isPlaceholder: true };
  }

  if (stateUnknown) {
    return { text: city!, isPlaceholder: false };
  }

  return { text: `${city} - ${state}`, isPlaceholder: false };
}

/**
 * Formata a filiação (Nome da Mãe) do candidato
 */
export function formatCandidateMother(motherName?: string | null): { text: string; isPlaceholder: boolean } {
  if (isFieldUnknown(motherName)) {
    return { text: MENSAGEM_LIBERACAO, isPlaceholder: true };
  }
  return { text: motherName!.toUpperCase(), isPlaceholder: false };
}

/**
 * Formata a data de nascimento do candidato
 */
export function formatCandidateBirth(dateOfBirth?: string | null): { text: string; isPlaceholder: boolean } {
  if (isFieldUnknown(dateOfBirth)) {
    return { text: MENSAGEM_LIBERACAO, isPlaceholder: true };
  }
  const dateStr = dateOfBirth!;
  if (dateStr.includes('/') || dateStr.includes('*')) {
    return { text: dateStr, isPlaceholder: false };
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { text: MENSAGEM_LIBERACAO, isPlaceholder: true };
    return { text: d.toLocaleDateString('pt-BR', { timeZone: 'UTC' }), isPlaceholder: false };
  } catch {
    return { text: MENSAGEM_LIBERACAO, isPlaceholder: true };
  }
}

/**
 * Formata o CPF/CNPJ do candidato para a exibição de prévia
 */
export function formatCandidateTaxId(taxId?: string | null): { text: string; isPlaceholder: boolean } {
  if (isFieldUnknown(taxId)) {
    return { text: MENSAGEM_LIBERACAO, isPlaceholder: true };
  }
  return { text: taxId!, isPlaceholder: false };
}
```

---

## 🎨 2. Aplicar nas Telas de Consulta

### A. Página de Busca Principal (`src/app/dashboard/page.tsx`)

1. Adicione os imports no topo:
```tsx
import { 
  formatCandidateLocation, 
  formatCandidateMother, 
  formatCandidateBirth, 
  formatCandidateTaxId 
} from '@/utils/candidate-helpers';
```

2. No bloco onde os candidatos são renderizados (`paginatedCandidates.map((c) => ...)`), substitua o interior da `div` de dados por:
```tsx
<div className="space-y-2 text-sm text-slate-600 dark:text-gray-300">
  <p className="font-bold text-slate-800 dark:text-white text-base capitalize">{c.name.toLowerCase()}</p>
  {(() => {
    const cpf = formatCandidateTaxId(c.taxIdNumber);
    const birth = formatCandidateBirth(c.dateOfBirth);
    const mother = formatCandidateMother(c.motherName);
    const loc = formatCandidateLocation(c.city, c.state);

    return (
      <>
        <p>
          <span className="font-semibold text-slate-400">CPF:</span>{' '}
          {cpf.isPlaceholder ? (
            <span className="text-primary font-medium">{cpf.text}</span>
          ) : (
            cpf.text
          )}
        </p>
        <p>
          <span className="font-semibold text-slate-400">Nascimento:</span>{' '}
          {birth.isPlaceholder ? (
            <span className="text-primary font-medium">{birth.text}</span>
          ) : (
            birth.text
          )}
        </p>
        <p>
          <span className="font-semibold text-slate-400">Mãe:</span>{' '}
          {mother.isPlaceholder ? (
            <span className="text-primary font-medium">{mother.text}</span>
          ) : (
            mother.text
          )}
        </p>
        <p>
          <span className="font-semibold text-slate-400">Localização:</span>{' '}
          {loc.isPlaceholder ? (
            <span className="text-primary font-medium">{loc.text}</span>
          ) : (
            loc.text
          )}
        </p>
      </>
    );
  })()}
</div>
```

---

### B. Página de Endereços (`src/app/dashboard/enderecos/page.tsx`) e Processos (`src/app/dashboard/processos/page.tsx`)

Aplique a mesma estrutura nos blocos de candidatos dessas duas páginas:
```tsx
import { 
  formatCandidateLocation, 
  formatCandidateMother, 
  formatCandidateTaxId 
} from '@/utils/candidate-helpers';
```
E na renderização do card:
```tsx
<div className="space-y-2 text-sm text-slate-600 dark:text-gray-300">
  <p className="font-bold text-slate-800 dark:text-white text-base capitalize">{c.name.toLowerCase()}</p>
  {(() => {
    const cpf = formatCandidateTaxId(c.taxIdNumber);
    const mother = formatCandidateMother(c.motherName);
    const loc = formatCandidateLocation(c.city, c.state);

    return (
      <>
        <p>
          <span className="font-semibold text-slate-400">CPF:</span>{' '}
          {cpf.isPlaceholder ? (
            <span className="text-primary font-medium">{cpf.text}</span>
          ) : (
            cpf.text
          )}
        </p>
        <p>
          <span className="font-semibold text-slate-400">Mãe:</span>{' '}
          {mother.isPlaceholder ? (
            <span className="text-primary font-medium">{mother.text}</span>
          ) : (
            mother.text
          )}
        </p>
        <p>
          <span className="font-semibold text-slate-400">Localização:</span>{' '}
          {loc.isPlaceholder ? (
            <span className="text-primary font-medium">{loc.text}</span>
          ) : (
            loc.text
          )}
        </p>
      </>
    );
  })()}
</div>
```

---

## 🛡️ 3. Sanitização no Provedor (`src/services/direct-data.ts`)

Para garantir que a API externa não propague strings brutas como `"DESCONHECIDO"` ou `"XX"`, adicione o filtro na montagem do array de `candidates`:

```typescript
if (filterRes?.success && filterRes?.listFilters && filterRes.listFilters.length > 0) {
  const sanitizeCandidateStr = (val: any) => {
    if (!val || typeof val !== 'string') return val;
    const t = val.trim();
    if (t.toLowerCase().includes('desconhecid') || t.toUpperCase() === 'XX' || t === 'N/I') return null;
    return t;
  };

  return {
    success: true,
    isMultiple: true,
    candidates: filterRes.listFilters.map((c: any) => ({
      id: c.id,
      name: c.fullName || c.name || (isPhone ? phone : cleanQuery),
      dateOfBirth: c.dateOfBirth,
      motherName: sanitizeCandidateStr(c.motherName),
      taxIdNumber: c.cpf || c.taxIdNumber,
      state: sanitizeCandidateStr(c.state),
      city: sanitizeCandidateStr(c.city)
    }))
  };
}
```

---

## 🚀 4. Comandos de Deploy

Após aplicar as alterações nos clones, compile e suba normalmente:

```bash
npm run build
git add .
git commit -m "feat: substitui termos desconhecidos por resultado apos confirmar e consultar na previa"
git push origin main
./update.sh
```
