# 📊 Generative Charts - Gerador de Gráficos com IA

> Crie e ajuste gráficos profissionais apenas descrevendo o que você quer. Powered by OpenAI GPT.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-green)

## ✨ Features

- 🤖 **IA Inteligente**: Descreva em linguagem natural e a IA cria o gráfico
- 🎨 **5 Tipos de Gráficos**: Barras, Linhas, Pizza, Área e Dispersão
- 📂 **Upload de Arquivos**: Suporte para CSV, JSON e Excel
- 🔄 **Sistema de Versões**: Cada ajuste é salvo como nova versão
- 📜 **Histórico Completo**: Acesse e restaure versões anteriores
- 🎯 **Detecção Automática**: IA detecta se é novo gráfico ou ajuste
- 💾 **Persistência Local**: Dados salvos no navegador
- 🎨 **Interface Moderna**: Design limpo e responsivo

## 🎥 Demo

1. **Criar Gráfico**: Digite "Crie um gráfico de barras: A=100, B=200, C=300"
2. **Ajustar**: Digite "Mude as cores para tons de azul"
3. **Upload**: Carregue um CSV e peça "Faça um gráfico de pizza"
4. **Histórico**: Veja todas as versões e restaure qualquer uma

## 🚀 Quick Start

```bash
# 1. Clone o projeto
git clone <seu-repo>
cd generative-charts

# 2. Instale dependências
npm install

# 3. Configure API Key
cp .env.example .env.local
# Edite .env.local e adicione sua OPENAI_API_KEY

# 4. Rode localmente
npm run dev

# 5. Abra no navegador
# http://localhost:3000
```

## 📚 Documentação

### Para Desenvolvedores Júnior
- 📖 **[GUIA-COMPLETO.md](./GUIA-COMPLETO.md)** - Tutorial passo a passo de como construir este app do zero
  - Conceitos de IA e LLM
  - Arquitetura do projeto
  - Implementação detalhada de cada parte
  - Perfeito para quem nunca trabalhou com IA

### Referência Rápida
- ⚡ **[GUIA-RAPIDO.md](./GUIA-RAPIDO.md)** - Referência visual e snippets de código
  - Fluxogramas
  - Comandos úteis
  - Troubleshooting
  - Customizações rápidas

### Outros Documentos
- 🔧 **[CORREÇÕES.md](./CORREÇÕES.md)** - Correções e migrações aplicadas
- 🎨 **[MUDANÇAS-INTERFACE.md](./MUDANÇAS-INTERFACE.md)** - Histórico de mudanças na UI

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **IA**: OpenAI GPT-3.5-turbo
- **Gráficos**: Recharts
- **Animações**: Framer Motion
- **Parsing**: PapaParse (CSV) + xlsx (Excel)

## 📦 Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx                 # Página principal
│   └── api/chat/route.ts        # Endpoint da IA
├── components/
│   ├── ChartRenderer.tsx        # Renderiza gráficos
│   ├── ChartHistory.tsx         # Histórico com versões
│   ├── FileUpload.tsx           # Upload de arquivos
│   └── charts/                  # Tipos de gráficos
├── lib/
│   ├── llm-service.ts           # Integração OpenAI
│   ├── file-parser.ts           # Processa arquivos
│   └── clear-history.ts         # Utilitário de limpeza
└── hooks/
    └── useChartHistory.ts       # Hook de histórico
```

## 🔑 Configuração da API Key

1. Crie uma conta em https://platform.openai.com
2. Gere uma API Key em https://platform.openai.com/api-keys
3. Adicione ao `.env.local`:

```env
OPENAI_API_KEY=sk-...
```

⚠️ **Importante**: Nunca commite a API key no Git!

## 💰 Custos Estimados

Com GPT-3.5-turbo:
- 100 gráficos: ~$0.08
- 1.000 gráficos: ~$0.75
- 10.000 gráficos: ~$7.50

Muito acessível para começar! 🎉

## 🎯 Como Usar

### Criar Novo Gráfico
```
"Crie um gráfico de barras mostrando vendas: 
Janeiro=1200, Fevereiro=1500, Março=1800"
```

### Ajustar Gráfico Existente
```
"Mude a cor das barras para azul"
"Adicione um gráfico de linha comparando com o ano passado"
"Altere o título para 'Vendas Trimestrais'"
```

### Com Arquivo CSV
1. Clique em "Carregar Arquivo"
2. Selecione seu CSV
3. Digite: "Crie um gráfico de pizza mostrando a distribuição"

## 🔧 Comandos Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Roda build
npm run lint         # Verifica código
```

## 🚀 Deploy

### Vercel (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Conecte seu repositório
2. Adicione `OPENAI_API_KEY` nas variáveis de ambiente
3. Deploy!

### Outros Serviços
- **Netlify**: Funciona perfeitamente
- **Railway**: Para apps com backend
- **AWS/Google Cloud**: Para escala maior

## 🐛 Troubleshooting

### Erro: "API key not found"
Certifique-se que `.env.local` existe e contém a chave.

### Histórico não funciona
Limpe o localStorage:
```javascript
// No console do navegador (F12)
clearChartHistory()
```

### Gráfico não renderiza
Verifique se os dados têm o formato correto:
```javascript
[{ name: "Item", value: 123 }]
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

- [ ] Mais tipos de gráficos (Radar, Treemap, Heatmap)
- [ ] Export para PNG/PDF
- [ ] Compartilhamento de gráficos
- [ ] Templates de gráficos
- [ ] Integração com bancos de dados
- [ ] Autenticação de usuários
- [ ] API pública
- [ ] Modo colaborativo

## 🎓 Aprenda Mais

### Para Iniciantes
Nunca trabalhou com IA? Comece aqui:
👉 **[GUIA-COMPLETO.md](./GUIA-COMPLETO.md)** - Tutorial completo do zero

### Para Desenvolvedores
Quer entender a arquitetura rapidamente:
👉 **[GUIA-RAPIDO.md](./GUIA-RAPIDO.md)** - Referência rápida com exemplos

### Recursos Externos
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Recharts Documentation](https://recharts.org)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 📄 Licença

Este projeto é open source e está disponível sob a [MIT License](LICENSE).

## 💬 Suporte

- 📧 Email: seu-email@example.com
- 💬 Discord: [Link do servidor]
- 🐦 Twitter: [@seu-twitter]
- 🐛 Issues: [GitHub Issues](../../issues)

## 🌟 Agradecimentos

- OpenAI pela API incrível
- Vercel pelo hosting gratuito
- Comunidade open source

---

**Feito com ❤️ para desenvolvedores que querem construir com IA**

Se este projeto foi útil, considere dar uma ⭐!
