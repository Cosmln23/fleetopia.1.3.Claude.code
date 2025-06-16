# Rezumatul Modificărilor - 16 Iunie 2024

## Funcționalități Noi și Îmbunătățiri

### 1. Refactorizare Pagina Marketplace
- **Filtrare Avansată**: Am adăugat tab-uri pentru a filtra ofertele de marfă: "Toate Ofertele", "Ofertele Mele" și "Oferte Acceptate".
- **API Extins**: Am modificat ruta API `/api/marketplace/cargo` pentru a suporta noua funcționalitate de filtrare bazată pe `listType`.
- **Componentă Reutilizabilă**: Am creat componenta `CargoOfferList` pentru a afișa listele de oferte, eliminând astfel duplicarea codului și simplificând mentenanța.

### 2. Sistem de Chat Nou
- **Iconițe în Antet**: Am adăugat iconițe pentru Chat și Notificări în bara de navigare principală pentru acces rapid.
- **Chat Stil Facebook**: Am înlocuit dialogul modal de chat cu un sistem de ferestre de chat flotante care apar în colțul din dreapta-jos, permițând utilizatorilor să navigheze în aplicație în timp ce conversează.
- **Management Global al Stării**: Am implementat un `ChatProvider` (folosind React Context) pentru a gestiona centralizat starea conversațiilor deschise.
- **Componente Modulare**: Am creat componentele `ChatManager` (pentru a afișa ferestrele active), `ChatWindow` (pentru conversația individuală) și `ChatPopover` (pentru a afișa lista de conversații din antet).

## Corecții de Bug-uri și Erori

- **Permisiuni Corectate**: Am ajustat vizibilitatea butoanelor de "Editare", "Ștergere" și "Asignare" pentru oferte, asigurându-mă că sunt vizibile doar pentru utilizatorul care a creat oferta.
- **Rezolvare Erori de Tip**: Am corectat multiple erori de tip TypeScript, în special cele legate de tipul `CargoOffer`, pentru a asigura robustețea codului.
- **Corecție Rută API**: Am rezolvat o eroare server-side recurentă în ruta API pentru chat (`/api/marketplace/cargo/[id]/chat/route.ts`).
- **Instalare Dependință Lipsă**: Am instalat pachetul lipsă `@radix-ui/react-popover` care cauza oprirea aplicației.
- **Management Procese**: A fost necesară oprirea și repornirea serverului de dezvoltare de mai multe ori pentru a regenera corect clientul Prisma și a rezolva problemele de blocare a fișierelor. 