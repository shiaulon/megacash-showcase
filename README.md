<p align="center">
  <img src="assets/megacash-icon.png" width="112" alt="MegaCash">
</p>

<h1 align="center">MegaCash</h1>

Aplicativo multiplataforma de gestao financeira pessoal, desenvolvido para transformar movimentacoes do dia a dia em uma visao clara de contas, cartoes, faturas, metas e patrimonio.

> Este repositorio e um showcase tecnico e de produto. O codigo-fonte, as credenciais e a infraestrutura de producao sao privados.

## Visao do produto

O MegaCash centraliza a vida financeira do usuario em uma experiencia disponivel para Android, iOS e Web. O produto foi construido com foco em sincronizacao entre dispositivos, clareza dos dados, seguranca e monetizacao por assinaturas.

## Demonstracao

<!-- Substituir os arquivos abaixo por capturas com dados ficticios antes da publicacao. -->

| Dashboard | Transacoes | Faturas |
| --- | --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Transacoes](docs/screenshots/transacoes.png) | ![Faturas](docs/screenshots/faturas.png) |

| Planejamento | Assinaturas | Administracao |
| --- | --- | --- |
| ![Planejamento](docs/screenshots/planejamento.png) | ![Planos](docs/screenshots/planos.png) | ![Portal administrativo](docs/screenshots/admin.png) |

## Principais recursos

- Dashboard financeiro com visao consolidada.
- Contas bancarias, cartoes, transacoes e categorias.
- Controle de faturas com regras de fechamento e vencimento.
- Planejamento financeiro, metas e recorrencias.
- Graficos e relatorios para acompanhamento de gastos.
- Exportacao e compartilhamento de dados.
- Sincronizacao entre Android, iOS e Web.
- Login com e-mail, Google e Apple.
- Protecao biometrica e controles de sessao.
- Planos Basic e Pro, trial e cupons promocionais.
- Compras integradas pela Google Play e App Store.
- Portal administrativo com usuarios, plataforma e assinaturas.
- Experiencia localizada em portugues, ingles, espanhol e frances.

## Tecnologias

| Area | Tecnologias |
| --- | --- |
| Aplicativo | Flutter, Dart, Material Design |
| Estado e dados | Streams, RxDart, cache local e sincronizacao reativa |
| Backend | Firebase Authentication, Cloud Firestore e Cloud Functions |
| Seguranca | Firebase App Check, regras do Firestore e validacoes no servidor |
| Assinaturas | Google Play Billing, StoreKit e `in_app_purchase` |
| Autenticacao | E-mail, Google Sign-In, Sign in with Apple e biometria |
| Analytics | Firebase Analytics e monitoramento interno de leituras |
| Relatorios | FL Chart, PDF e CSV |
| Qualidade | Testes Flutter, testes de backend e analise estatica |
| Entrega | Google Play Console, App Store Connect e TestFlight |

## Arquitetura

```mermaid
flowchart LR
    A[Flutter: Android, iOS e Web] --> B[Camada de servicos]
    B --> C[Firebase Authentication]
    B --> D[Cloud Firestore]
    B --> E[Cloud Functions]
    A --> F[Google Play Billing]
    A --> G[Apple StoreKit]
    E --> F
    E --> G
    H[Portal administrativo] --> C
    H --> D
    H --> E
```

As operacoes sensiveis permanecem no backend. O aplicativo solicita a compra, a loja processa o pagamento e o servidor valida o resultado antes de conceder acesso. Regras de seguranca limitam cada usuario aos proprios dados e separam as permissoes administrativas.

Uma explicacao mais detalhada esta em [Arquitetura](docs/ARCHITECTURE.md).

## Desafios resolvidos

### Assinaturas em duas lojas

Foi criada uma camada comum para representar planos, periodos, trials e promocoes, preservando as particularidades do Google Play Billing e do StoreKit. A validacao no servidor evita que o cliente seja a fonte de verdade da assinatura.

### Cupons e campanhas

O fluxo promocional relaciona campanhas a planos e ofertas configuradas nas lojas. Isso permite limitar elegibilidade, uso por usuario e quantidade de resgates, mantendo a renovacao posterior de acordo com as regras da loja.

### Sincronizacao e custo

Consultas foram organizadas por contexto, com cache e observacao apenas dos dados necessarios. Um monitor interno mede leituras por origem para identificar telas caras e orientar otimizacoes no Firestore.

### Regras de fatura

O dominio considera fechamento e vencimento separadamente. Compras feitas a partir do dia de fechamento sao direcionadas para o ciclo seguinte, evitando distorcoes no controle mensal.

## Minha participacao

- Concepcao e evolucao do produto.
- Arquitetura do aplicativo e do backend Firebase.
- Desenvolvimento Flutter para Android, iOS e Web.
- Modelagem do banco e regras de seguranca.
- Integracao de pagamentos e assinaturas nas duas lojas.
- Criacao do sistema de cupons e campanhas.
- Desenvolvimento do portal administrativo.
- Testes, investigacao de falhas e publicacao nas lojas.

## Privacidade deste repositorio

Este material nao contem:

- codigo-fonte do produto;
- chaves, certificados ou arquivos de ambiente;
- regras e funcoes completas de producao;
- IDs internos de produtos ou campanhas;
- dados pessoais ou financeiros reais.

O conteudo deste repositorio e protegido por direitos autorais. Consulte [LICENSE](LICENSE).

## Contato

Disponivel para demonstracao tecnica guiada e discussao sobre as decisoes de arquitetura, produto e monetizacao.
