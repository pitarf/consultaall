# Guia de Replicação: Blindagem de Dados Pré-Consulta e Proteção Comercial

Este guia contém as instruções completas para aplicar a melhoria de segurança comercial e conversão nos sistemas clones/cópia do **Detetive Buscas / ConsultaALL**.

---

## 🎯 Objetivo Comercial e de Segurança

### 1. O Problema Anterior (Vazamento de Dados Gratuitos)
Quando o usuário pesquisava por **Telefone**:
- O sistema já exibia o **Nome Completo** no título do card (ex: "Adriano Garcia Do Amaral").
- Exibia partes do **Nome da Mãe** (ex: `**** GARCIA DO AMARAL`).
- Exibia o **Ano de Nascimento** (ex: `**/**/1973`).
- **Consequência:** O usuário só queria saber de quem era o número. Como o nome já aparecia de graça, ele simplesmente não pagava a consulta (R$ 0,00) e saía satisfeito sem gastar saldo.

### 2. A Solução Aplicada
- **Busca por Telefone:** O nome real é **100% ocultado** antes do pagamento tanto no frontend quanto na resposta da API no backend. O título do card exibe: `"Titular do Telefone"` ou `"Titular Vinculado (Perfil 1, 2...)"`.
- **Mãe, Nascimento e Localização:** Exibem estritamente `"Resultado após confirmar e consultar"`.
- **CPF:** É o **ÚNICO** dado com visualização parcial (`***.796.990-**`), garantindo que o cliente confirme a existência do cadastro sem receber o dossiê de graça.

---

## 📦 1. Utilitário Centralizado (`src/utils/candidate-helpers.ts`)

```typescript
/**
 * Utilitários para formatação e exibição dos cards de prévia de candidatos
 * Blindagem de dados pré-consulta: oculta nomes reais em buscas de telefone e oculta
 * dados sensíveis (mãe, nascimento, localização) até a confirmação e pagamento da consulta.
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
 * Formata o título principal do card de candidato.
 * Em buscas por telefone, oculta o nome real para impedir que o usuário obtenha o dado gratuitamente.
 */
export function formatCandidateTitle(name: string | undefined | null, isPhone: boolean, index: number = 0, total: number = 1): string {
  if (isPhone) {
    return total > 1 ? `Titular Vinculado (Perfil ${index + 1})` : 'Titular do Telefone';
  }
  if (!name || isFieldUnknown(name)) {
    return total > 1 ? `Perfil Correspondente #${index + 1}` : 'Perfil Correspondente';
  }
  return name;
}

/**
 * Formata a localização do candidato na prévia.
 */
export function formatCandidateLocation(city?: string | null, state?: string | null): { text: string; isPlaceholder: boolean } {
  return { text: MENSAGEM_LIBERACAO, isPlaceholder: true };
}

/**
 * Formata a filiação (Nome da Mãe) do candidato na prévia.
 */
export function formatCandidateMother(motherName?: string | null): { text: string; isPlaceholder: boolean } {
  return { text: MENSAGEM_LIBERACAO, isPlaceholder: true };
}

/**
 * Formata a data de nascimento do candidato na prévia.
 */
export function formatCandidateBirth(dateOfBirth?: string | null): { text: string; isPlaceholder: boolean } {
  return { text: MENSAGEM_LIBERACAO, isPlaceholder: true };
}

/**
 * Formata o CPF do candidato para a exibição de prévia.
 * ÚNICO campo parcialmente visível (3 dígitos centrais com máscara).
 */
export function formatCandidateTaxId(taxId?: string | null): { text: string; isPlaceholder: boolean } {
  if (isFieldUnknown(taxId)) {
    return { text: MENSAGEM_LIBERACAO, isPlaceholder: true };
  }
  return { text: taxId!, isPlaceholder: false };
}
```

---

## 🛡️ 2. Blindagem no Backend (`src/services/direct-data.ts`)

Na função `performSmartSearch`, quando retornar a lista de filtros da Etapa 1:

```typescript
if (filterRes?.success && filterRes?.listFilters && filterRes.listFilters.length > 0) {
  const totalCand = filterRes.listFilters.length;
  return {
    success: true,
    isMultiple: true,
    candidates: filterRes.listFilters.map((c: any, idx: number) => ({
      id: c.id,
      // Em buscas por telefone, oculta o nome real para não entregar a resposta antes do pagamento
      name: isPhone 
        ? (totalCand > 1 ? `Titular Vinculado (Perfil ${idx + 1})` : 'Titular do Telefone')
        : (c.fullName || c.name || cleanQuery),
      dateOfBirth: null, // Oculto na prévia
      motherName: null,  // Oculto na prévia
      taxIdNumber: c.cpf || c.taxIdNumber, // Apenas os 3 dígitos do CPF com máscara
      state: null,
      city: null,
      isPhoneSearch: isPhone
    }))
  };
}
```

---

## 🔒 3. Blindagem no Server Action (`src/app/actions/consultas.ts`)

Antes de registrar o histórico `telefone_candidatos` e devolver ao frontend:

```typescript
if (Array.isArray(apiResult.candidates)) {
  const totalCands = apiResult.candidates.length;
  apiResult.candidates = apiResult.candidates.map((cand: any, idx: number) => ({
    id: cand.id,
    name: target === 'telefone'
      ? (totalCands > 1 ? `Titular Vinculado (Perfil ${idx + 1})` : 'Titular do Telefone')
      : cand.name,
    taxIdNumber: cand.taxIdNumber,
    motherName: null,
    dateOfBirth: null,
    city: null,
    state: null,
    isPhoneSearch: target === 'telefone'
  }));
}
```

---

## 🎨 4. Renderização do Card no Frontend (`src/app/dashboard/page.tsx`)

```tsx
{paginatedCandidates.map((c, index) => {
  const isPhone = Boolean(c.isPhoneSearch || chaveTipo === 'telefone');
  const candidateTitle = formatCandidateTitle(c.name, isPhone, startIndex + index, candidates.length);
  const cpf = formatCandidateTaxId(c.taxIdNumber);
  const birth = formatCandidateBirth(c.dateOfBirth);
  const mother = formatCandidateMother(c.motherName);
  const loc = formatCandidateLocation(c.city, c.state);

  return (
    <div key={c.id} className="...">
      <div className="space-y-2 text-sm text-slate-600 dark:text-gray-300">
        <p className="font-bold text-slate-800 dark:text-white text-base capitalize">{candidateTitle.toLowerCase()}</p>
        <p><span className="font-semibold text-slate-400">CPF:</span> {cpf.isPlaceholder ? <span className="text-primary font-medium">{cpf.text}</span> : cpf.text}</p>
        <p><span className="font-semibold text-slate-400">Nascimento:</span> {birth.isPlaceholder ? <span className="text-primary font-medium">{birth.text}</span> : birth.text}</p>
        <p><span className="font-semibold text-slate-400">Mãe:</span> {mother.isPlaceholder ? <span className="text-primary font-medium">{mother.text}</span> : mother.text}</p>
        <p><span className="font-semibold text-slate-400">Localização:</span> {loc.isPlaceholder ? <span className="text-primary font-medium">{loc.text}</span> : loc.text}</p>
      </div>
      <button onClick={() => handleSelectCandidate(c.id)}>
        Confirmar e Consultar (R$ ...)
      </button>
    </div>
  );
})}
```
