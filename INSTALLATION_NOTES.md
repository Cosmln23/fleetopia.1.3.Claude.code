# 📦 Note de Instalare - Fleetopia.co

## ⚠️ Important: Node Modules

Această arhivă **NU include** directorul `node_modules` pentru a reduce dimensiunea fișierului. 

### După Extragerea Arhivei:

1. **Navighează în directorul aplicației:**
```bash
cd fleetopia-dashboard/app
```

2. **Instalează dependențele:**
```bash
yarn install
# SAU
npm install
```

3. **Pornește aplicația:**
```bash
yarn dev
# SAU
npm run dev
```

## 📋 Verificare Rapidă

După instalarea dependențelor, verifică că totul funcționează:

```bash
# Verifică că dependențele sunt instalate
ls node_modules

# Pornește serverul de dezvoltare
yarn dev

# Deschide în browser
# http://localhost:3000
```

## 🔧 Dependențe Principale

Aplicația folosește următoarele tehnologii principale:
- **Next.js 14** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Prisma** - Database ORM
- **shadcn/ui** - UI Components
- **React Query** - State management

## 📚 Documentație

- **README.md** - Documentația completă a proiectului
- **VS_CODE_SETUP.md** - Ghid pentru configurarea VS Code

## 🚀 Primul Pas

```bash
# 1. Extrage arhiva
unzip fleetopia-complete.zip

# 2. Navighează în proiect
cd fleetopia-dashboard

# 3. Citește documentația
cat README.md

# 4. Configurează VS Code
cat VS_CODE_SETUP.md

# 5. Instalează și rulează
cd app
yarn install
yarn dev
```

**Succes cu dezvoltarea Transport Paradise!** 🌟