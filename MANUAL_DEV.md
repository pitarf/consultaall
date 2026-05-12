# Manual do Desenvolvedor - ConsultaALL

## Integração de API e Modo Híbrido
O sistema utiliza um motor híbrido em `src/services/api-consulta.ts`.
- **Modo Real:** Ativado quando `isTest: false`. Utiliza `fetch` para `https://services.apiconsultabrasil.com/`.
- **Modo Demo:** Ativado quando `isTest: true`. Retorna dados do `api-sample-response.json` sem custo.
- **Segurança:** O frontend verifica o `role: 'ADMIN'` antes de permitir a exibição do switch de modo.

## Sistema de Cache (48 Horas)
Implementado na Server Action `realizarConsulta`.
- **Funcionamento:** Antes de qualquer chamada externa, o banco de dados é consultado em busca de uma entrada idêntica (`target` + `query`) com menos de 48h de idade.
- **Benefício:** Reduz drasticamente o custo operacional ao reutilizar resultados de consultas frequentes.

## Variáveis de Ambiente Necessárias (.env)
```env
API_CONSULTA_TOKEN=token_da_api_consultas_brasil
PUSHINPAY_TOKEN=token_do_gateway_pagamentos
PUSHINPAY_WEBHOOK_TOKEN=token_de_seguranca_do_webhook
```

## Monitoramento de Logs
- **SystemLog:** Registra falhas de API (com o JSON de erro completo), trocas de senha e confirmações de saldo. Visualizável em `/admin/logs`.
