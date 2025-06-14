# Fleetopia.co - Ghid de Colaborare pentru Asistenți AI

**Ultima actualizare:** 14 Iunie 2024

Acest document descrie starea actuală a proiectului Fleetopia.co și protocolul de colaborare stabilit.

---

## 1. Prezentare Generală a Proiectului

**Fleetopia.co** este o platformă logistică avansată, dezvoltată în Next.js, care utilizează concepte de inteligență artificială pentru a eficientiza managementul flotelor de transport.

### Componente Principale:

1.  **AI Dispatcher (`/ai-agents`):** Un centru de comandă centralizat care monitorizează și gestionează operațiunile. Acesta este "creierul" sistemului.
2.  **Logistics Marketplace (`/marketplace`):** O piață digitală unde utilizatorii pot posta oferte de marfă (cerere) și pot căuta transport (ofertă).
3.  **Real-time & Analytics (`/real-time`):** Un panou de bord pentru monitorizarea live a flotei (hărți, alerte) și pentru analiza performanței.

---

## 2. Starea Funcțională Actuală

Platforma a depășit stadiul de prototip static și are un prim flux funcțional complet implementat:

*   **Publicare Ofertă:** Utilizatorii pot completa și trimite formularul din `Marketplace -> Post Cargo`.
*   **Salvare în Baza de Date:** Oferta este salvată în baza de date PostgreSQL prin intermediul unui API (`/api/marketplace/cargo`).
*   **Afișare Dinamică:** Lista de oferte din `Marketplace -> Find Cargo` se încarcă direct din baza de date, afișând în timp real toate ofertele active.
*   **Ștergere Securizată:** Fiecare ofertă are un buton de ștergere care deschide un dialog de confirmare. La confirmare, oferta este eliminată definitiv din baza de date printr-un API dedicat (`/api/marketplace/cargo/[id]`).
*   **Notificarea Dispecerului:** La publicarea unei noi oferte, se creează automat o `SystemAlert` în baza de date.
*   **Recepția Alertei:** Pagina `AI Dispatcher` interoghează periodic un API (`/api/dispatcher/alerts`) și afișează noile alerte, închizând astfel bucla funcțională între Marketplace și centrul de comandă.

---

## 3. Tehnologii Utilizate

*   **Framework:** Next.js (App Router)
*   **Limbaj:** TypeScript
*   **Baza de Date:** PostgreSQL
*   **ORM:** Prisma
*   **Stilizare:** Tailwind CSS
*   **Componente UI:** shadcn/ui
*   **Animații:** Framer Motion

---

## 4. Protocol de Colaborare (Workflow)

Orice modificare adusă proiectului trebuie să urmeze acest protocol strict:

1.  **Propunerea:** Asistentul AI analizează starea curentă și propune următorul pas logic de dezvoltare.
2.  **Confirmarea:** Utilizatorul (tu) analizează propunerea și își dă acordul explicit pentru a începe.
3.  **Implementarea:** Asistentul AI execută modificările tehnice necesare pentru a implementa pasul aprobat.
4.  **Salvarea și Sincronizarea:** Imediat după implementare, progresul este salvat folosind următorul flux de comenzi Git:
    *   `git add .`
    *   `git commit -m "feat: [descriere clară a modificării]"`
    *   `git push`
5.  **Actualizarea Documentației:** (Opcțional, dacă se fac schimbări majore) Se actualizează acest fișier sau alte documente relevante.
6.  **Iterația:** Ciclul se reia cu propunerea următorului pas.

### Regula de Aur:

**Nu se modifică codul existent, ci se extinde.** Se adaugă funcționalități noi fără a altera fundamental logica deja implementată și confirmată. Obiectivul este să construim peste fundația existentă, nu să o reconstruim.

Acest proces asigură o dezvoltare incrementală, sigură și foarte bine documentată. 