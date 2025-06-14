# 🚀 Ghid Setup VS Code pentru Fleetopia.co

## 📋 Cuprins
1. [Deschiderea Proiectului în VS Code](#deschiderea-proiectului)
2. [Extensii Recomandate](#extensii-recomandate)
3. [Configurare pentru Dezvoltare](#configurare-dezvoltare)
4. [Comenzi Utile](#comenzi-utile)
5. [Debugging și Testing](#debugging-testing)
6. [Shortcuts și Productivitate](#shortcuts-productivitate)
7. [Troubleshooting](#troubleshooting)

## 🎯 Deschiderea Proiectului în VS Code {#deschiderea-proiectului}

### Metoda 1: Din Terminal
```bash
# Navighează în directorul proiectului
cd /path/to/fleetopia-dashboard

# Deschide VS Code în directorul curent
code .
```

### Metoda 2: Din VS Code
1. **Deschide VS Code**
2. **File → Open Folder** (Ctrl+K Ctrl+O)
3. **Selectează** directorul `fleetopia-dashboard`
4. **Click Open**

### Metoda 3: Drag & Drop
- **Trage** directorul `fleetopia-dashboard` peste iconița VS Code

## 🔧 Extensii Recomandate {#extensii-recomandate}

### Extensii Esențiale (Obligatorii)

#### 1. **ES7+ React/Redux/React-Native snippets**
- **ID**: `dsznajder.es7-react-js-snippets`
- **Scop**: Snippets pentru React și TypeScript
- **Instalare**: `Ctrl+Shift+X` → caută "ES7 React"

#### 2. **TypeScript Importer**
- **ID**: `pmneo.tsimporter`
- **Scop**: Auto-import pentru TypeScript
- **Instalare**: Caută "TypeScript Importer"

#### 3. **Tailwind CSS IntelliSense**
- **ID**: `bradlc.vscode-tailwindcss`
- **Scop**: Autocomplete pentru clasele Tailwind
- **Instalare**: Caută "Tailwind CSS IntelliSense"

#### 4. **Prisma**
- **ID**: `Prisma.prisma`
- **Scop**: Syntax highlighting pentru schema Prisma
- **Instalare**: Caută "Prisma"

#### 5. **ESLint**
- **ID**: `dbaeumer.vscode-eslint`
- **Scop**: Linting pentru JavaScript/TypeScript
- **Instalare**: Caută "ESLint"

#### 6. **Prettier - Code formatter**
- **ID**: `esbenp.prettier-vscode`
- **Scop**: Formatare automată a codului
- **Instalare**: Caută "Prettier"

### Extensii Recomandate (Opționale)

#### 7. **Auto Rename Tag**
- **ID**: `formulahendry.auto-rename-tag`
- **Scop**: Redenumire automată tag-uri HTML/JSX

#### 8. **Bracket Pair Colorizer 2**
- **ID**: `CoenraadS.bracket-pair-colorizer-2`
- **Scop**: Colorarea parantezelor pentru vizibilitate

#### 9. **GitLens**
- **ID**: `eamodio.gitlens`
- **Scop**: Funcționalități Git avansate

#### 10. **Thunder Client**
- **ID**: `rangav.vscode-thunder-client`
- **Scop**: Client REST pentru testarea API-urilor

#### 11. **Error Lens**
- **ID**: `usernamehw.errorlens`
- **Scop**: Afișarea erorilor inline în cod

#### 12. **Material Icon Theme**
- **ID**: `PKief.material-icon-theme`
- **Scop**: Icoane frumoase pentru fișiere

### Instalare Rapidă Toate Extensiile

Creează fișierul `.vscode/extensions.json` în proiect:

```json
{
  "recommendations": [
    "dsznajder.es7-react-js-snippets",
    "pmneo.tsimporter",
    "bradlc.vscode-tailwindcss",
    "Prisma.prisma",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "formulahendry.auto-rename-tag",
    "CoenraadS.bracket-pair-colorizer-2",
    "eamodio.gitlens",
    "rangav.vscode-thunder-client",
    "usernamehw.errorlens",
    "PKief.material-icon-theme"
  ]
}
```

VS Code va sugera automat instalarea acestor extensii.

## ⚙️ Configurare pentru Dezvoltare {#configurare-dezvoltare}

### 1. Configurări VS Code

Creează fișierul `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "editor.quickSuggestions": {
    "strings": true
  },
  "css.validate": false,
  "scss.validate": false,
  "less.validate": false
}
```

### 2. Configurare Prettier

Creează fișierul `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 3. Configurare ESLint

Fișierul `.eslintrc.json` ar trebui să existe deja, dar verifică configurația:

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off"
  }
}
```

### 4. Configurare Tasks

Creează fișierul `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "shell",
      "command": "yarn",
      "args": ["dev"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "options": {
        "cwd": "${workspaceFolder}/app"
      }
    },
    {
      "label": "build",
      "type": "shell",
      "command": "yarn",
      "args": ["build"],
      "group": "build",
      "options": {
        "cwd": "${workspaceFolder}/app"
      }
    },
    {
      "label": "lint",
      "type": "shell",
      "command": "yarn",
      "args": ["lint"],
      "group": "test",
      "options": {
        "cwd": "${workspaceFolder}/app"
      }
    }
  ]
}
```

## 🚀 Comenzi Utile pentru Dezvoltare {#comenzi-utile}

### Terminal Integrat

Deschide terminalul în VS Code: **Ctrl+`** (backtick)

### Comenzi Yarn/NPM

```bash
# Navighează în directorul app
cd app

# Instalează dependențele
yarn install

# Pornește serverul de dezvoltare
yarn dev

# Construiește pentru producție
yarn build

# Pornește serverul de producție
yarn start

# Rulează linting
yarn lint

# Verifică tipurile TypeScript
npx tsc --noEmit
```

### Comenzi Prisma

```bash
# Generează clientul Prisma
npx prisma generate

# Vizualizează baza de date
npx prisma studio

# Resetează baza de date
npx prisma db push --force-reset

# Migrări
npx prisma migrate dev
```

### Comenzi Git

```bash
# Status
git status

# Adaugă fișiere
git add .

# Commit
git commit -m "Descrierea modificării"

# Push
git push origin main
```

## 🐛 Debugging și Testing {#debugging-testing}

### 1. Configurare Debugging

Creează fișierul `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/app/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### 2. Debugging în Browser

1. **Pornește** aplicația cu `yarn dev`
2. **Deschide** http://localhost:3000 în Chrome
3. **F12** pentru Developer Tools
4. **Sources** tab pentru debugging

### 3. Console Logging

```typescript
// Pentru debugging în componente
console.log('Debug info:', data);

// Pentru debugging în API routes
console.error('API Error:', error);
```

## ⌨️ Shortcuts și Productivitate {#shortcuts-productivitate}

### Shortcuts Esențiale

| Shortcut | Acțiune |
|----------|---------|
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+P` | Quick Open File |
| `Ctrl+Shift+E` | Explorer |
| `Ctrl+Shift+F` | Search în toate fișierele |
| `Ctrl+Shift+G` | Source Control (Git) |
| `Ctrl+Shift+D` | Debug |
| `Ctrl+Shift+X` | Extensions |
| `Ctrl+`` | Terminal |
| `Ctrl+B` | Toggle Sidebar |
| `Ctrl+J` | Toggle Panel |

### Shortcuts pentru Editare

| Shortcut | Acțiune |
|----------|---------|
| `Ctrl+D` | Selectează următoarea apariție |
| `Ctrl+Shift+L` | Selectează toate aparițiile |
| `Alt+Click` | Multiple cursors |
| `Ctrl+Shift+K` | Șterge linia |
| `Alt+Up/Down` | Mută linia |
| `Ctrl+/` | Toggle comment |
| `Shift+Alt+F` | Format document |
| `Ctrl+Space` | Trigger IntelliSense |

### Snippets Utile pentru React

| Snippet | Rezultat |
|---------|----------|
| `rafce` | React Arrow Function Component Export |
| `useState` | useState hook |
| `useEffect` | useEffect hook |
| `imr` | Import React |
| `imrd` | Import ReactDOM |

## 🔧 Troubleshooting {#troubleshooting}

### Probleme Comune și Soluții

#### 1. **TypeScript Errors**
```bash
# Reinstalează dependențele
rm -rf node_modules yarn.lock
yarn install

# Restart TypeScript server
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### 2. **ESLint/Prettier Conflicts**
```bash
# Verifică configurația
yarn lint --fix

# Formatează toate fișierele
npx prettier --write .
```

#### 3. **Tailwind CSS nu funcționează**
- Verifică că extensia Tailwind CSS IntelliSense este instalată
- Restart VS Code
- Verifică `tailwind.config.ts`

#### 4. **Import Errors**
```bash
# Regenerează types
npx prisma generate

# Restart TypeScript
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### 5. **Hot Reload nu funcționează**
```bash
# Restart dev server
Ctrl+C în terminal
yarn dev
```

### Comenzi de Curățare

```bash
# Curăță cache Next.js
rm -rf .next

# Curăță node_modules
rm -rf node_modules yarn.lock
yarn install

# Curăță cache Prisma
npx prisma generate
```

## 📚 Resurse Utile

### Documentație
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

### VS Code Resources
- [VS Code Documentation](https://code.visualstudio.com/docs)
- [VS Code Shortcuts](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf)

## 🎯 Workflow Recomandat

### 1. **Începutul Zilei**
```bash
# Deschide proiectul
code /path/to/fleetopia-dashboard

# Verifică status Git
git status

# Pull ultimele modificări
git pull origin main

# Pornește dev server
cd app && yarn dev
```

### 2. **În timpul Dezvoltării**
- **Salvează frecvent** (Ctrl+S)
- **Folosește** auto-format on save
- **Verifică** erorile în Problems panel
- **Testează** în browser la http://localhost:3000

### 3. **Sfârșitul Zilei**
```bash
# Verifică modificările
git status

# Adaugă fișierele
git add .

# Commit cu mesaj descriptiv
git commit -m "feat: adaugă funcționalitate nouă"

# Push modificările
git push origin main
```

## 🌟 Tips pentru Productivitate

### 1. **Folosește Workspace**
- Salvează workspace-ul: **File → Save Workspace As**
- Deschide rapid: **File → Open Recent**

### 2. **Organizează Fișierele**
- Folosește **Explorer** pentru navigare
- **Ctrl+P** pentru deschidere rapidă
- **Ctrl+Tab** pentru switch între fișiere

### 3. **Folosește IntelliSense**
- **Ctrl+Space** pentru sugestii
- **Ctrl+.** pentru quick fixes
- **F12** pentru Go to Definition

### 4. **Debugging Eficient**
- Folosește **console.log** pentru debugging rapid
- **Breakpoints** pentru debugging detaliat
- **React Developer Tools** în browser

---

## 🎉 Gata de Dezvoltare!

Acum ai toate instrumentele necesare pentru a dezvolta eficient în **Fleetopia.co**! 

### Următorii Pași:
1. ✅ **Instalează** extensiile recomandate
2. ✅ **Configurează** settings.json
3. ✅ **Pornește** serverul de dezvoltare
4. ✅ **Începe** să construiești Transport Paradise!

**Happy Coding!** 🚀✨

---

*Ghid creat pentru Transport Paradise Builders*
*VS Code • TypeScript • React • Next.js • Tailwind CSS*