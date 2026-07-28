'use client';

import { useEffect, useRef } from "react";

interface SeoPageContentProps {
  html: string;
  isAdminCreated: boolean;
}

/**
 * Componente cliente unificado para renderizar o conteúdo HTML de páginas SEO.
 * Garante o parseamento correto do HTML, preservação de estilos e a execução dinâmica
 * de scripts de forma segura (sem usar eval ou dangerouslySetInnerHTML para os scripts).
 * Executa scripts somente para páginas criadas por administradores autenticados.
 */
export function SeoPageContent({ html, isAdminCreated }: SeoPageContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !html) return;

    // Impede execução duplicada se o HTML for idêntico
    if (lastAppliedRef.current === html) return;
    lastAppliedRef.current = html;

    // Define o conteúdo HTML
    console.log("[SeoPageContent] Inicializando HTML. Tamanho:", html.length);
    container.innerHTML = html;

    // Executa scripts somente em páginas criadas por administradores autenticados
    if (!isAdminCreated) {
      console.log("[SeoPageContent] Ignorando scripts: não criado por admin.");
      return;
    }

    const scripts = Array.from(container.querySelectorAll("script"));
    console.log("[SeoPageContent] Scripts encontrados para execução:", scripts.length);

    scripts.forEach((oldScript, idx) => {
      try {
        const script = document.createElement("script");

        // Copia todos os atributos do script antigo
        Array.from(oldScript.attributes).forEach((attribute) => {
          script.setAttribute(attribute.name, attribute.value);
        });

        // Define e executa o código do script de forma segura (sem eval)
        script.textContent = oldScript.textContent ?? "";
        console.log(`[SeoPageContent] Executando script #${idx + 1} de tamanho:`, script.textContent.length);
        oldScript.replaceWith(script);
      } catch (err) {
        console.error(`[SeoPageContent] Erro ao executar script #${idx + 1}:`, err);
      }
    });

    return () => {
      lastAppliedRef.current = null;
    };
  }, [html, isAdminCreated]);

  return <div ref={containerRef} className="w-full" />;
}
