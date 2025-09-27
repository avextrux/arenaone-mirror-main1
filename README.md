# ArenaOne - O Sistema Operacional do Futebol Global

Clone pixel-perfect do site oficial da ArenaOne (https://arenaone.netlify.app/).

## Sobre o Projeto

A ArenaOne é a plataforma que transformará a indústria de US$ 700 bilhões do futebol, unificando operações de clubes, performance de atletas e gestão de carreiras em um único ecossistema inteligente.

## Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Vite** - Ferramenta de build rápida
- **shadcn/ui** - Componentes UI reutilizáveis
- **Lucide React** - Ícones SVG
- **React Router** - Roteamento do lado cliente

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── Header.tsx      # Cabeçalho do site
│   ├── HeroSection.tsx # Seção hero principal
│   ├── ProblemSection.tsx # Seção "O Problema"
│   ├── SolutionSection.tsx # Seção "A Solução"
│   ├── PlatformSection.tsx # Seção "Arquitetura da Plataforma"
│   ├── ContactSection.tsx # Seção de contato
│   └── Footer.tsx      # Rodapé
├── pages/              # Páginas da aplicação
├── lib/               # Utilitários
└── hooks/             # React hooks customizados

public/
└── images/            # Assets de imagem
    ├── arenaone-logo.svg
    ├── stats-icon.svg
    ├── hero-dashboard.svg
    ├── platform-icon.svg
    ├── solution-icon.svg
    └── football-hero.jpg
```

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos para execução local

1. **Clone o repositório**
```bash
git clone <URL_DO_REPOSITORIO>
cd arenaone-clone
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute em modo de desenvolvimento**
```bash
npm run dev
```

4. **Acesse no navegador**
```
http://localhost:8080
```

### Build para produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## Deploy

### Netlify (Recomendado)

1. **Via GitHub:**
   - Conecte seu repositório GitHub ao Netlify
   - Configure o build command: `npm run build`
   - Configure o publish directory: `dist`
   - Deploy automático a cada push

2. **Via Drag & Drop:**
   - Execute `npm run build`
   - Arraste a pasta `dist/` para o Netlify Drop

### Outras plataformas

- **Vercel:** Conecte o repositório GitHub
- **GitHub Pages:** Configure o workflow de deploy
- **Firebase Hosting:** Use `firebase deploy`

## Características Implementadas

### Design System
- Cores da marca ArenaOne (#0039FF, #00C2FF, #001A73)
- Tipografia Inter como fonte principal
- Componentes reutilizáveis com variantes
- Design responsivo mobile-first

### Seções do Site

1. **Header** - Navegação e botões de autenticação
2. **Hero** - Título principal, descrição e estatísticas
3. **O Problema** - 3 cards explicando desafios da indústria
4. **A Solução** - ArenaOne como solução integrada
5. **Arquitetura da Plataforma** - 3 ecossistemas (Club OS, Performance OS, Player OS)
6. **Contato** - Formulário funcional de contato
7. **Footer** - Links e informações da empresa

### Funcionalidades
- Navegação suave entre seções
- Formulário de contato funcional
- Responsividade completa (320px - 1920px)
- Animações e transições
- SEO otimizado
- Acessibilidade (ARIA labels, alt texts)

## Personalização

### Cores
Edite as variáveis CSS em `src/index.css`:
```css
:root {
  --primary: 227 100% 50%;       /* #0039FF */
  --primary-hover: 195 100% 50%; /* #00C2FF */
  --primary-dark: 227 100% 23%;  /* #001A73 */
}
```

### Conteúdo
Modifique os textos diretamente nos componentes em `src/components/`.

### Imagens
Substitua as imagens em `public/images/` mantendo os mesmos nomes.

## Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza build de produção
- `npm run lint` - Executa linting do código

## Licença

Este projeto é um clone educacional do site ArenaOne para fins de demonstração técnica.

## Contato

Para dúvidas sobre este projeto, abra uma issue no repositório.