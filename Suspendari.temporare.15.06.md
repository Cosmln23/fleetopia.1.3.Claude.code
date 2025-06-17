# Jurnal de Suspendări Temporare - 15 Iunie 2024

Acest document înregistrează deciziile de a suspenda temporar anumite funcționalități sau de a implementa soluții de compromis, pentru a permite progresul în alte arii ale proiectului.

---

## 1. Suspendarea Asocierii Utilizatorului la Crearea Ofertelor de Marfă

- **Componenta Afectată:** API-ul de la `/api/marketplace/cargo` (metoda `POST`).
- **Problemă:** Schema Prisma a fost actualizată pentru a include o relație între `CargoOffer` și `User` (printr-un `userId`). Totuși, sistemul de autentificare (Clerk) nu este încă integrat în aplicație, ceea ce făcea imposibilă furnizarea unui `userId` valid la crearea unei noi oferte, generând o eroare de tipare la compilare.
- **Soluție Temporară:**
    1.  S-a confirmat că relația în `prisma/schema.prisma` este deja **opțională**.
    2.  Pentru a ocoli o problemă de tipare persistentă în clientul Prisma generat, codul din endpoint-ul API a fost modificat pentru a nu mai încerca să trimită un `userId`.
- **Status:** Suspendat temporar.
- **Plan de Acțiune Viitor:** La integrarea sistemului de autentificare Clerk, logica din endpoint va fi actualizată pentru a prelua `userId` al utilizatorului autentificat și a-l asocia corect la noua ofertă de marfă creată.

---

## 2. Activarea Legării Periculoase a Conturilor OAuth cu Același Email

- **Componenta Afectată:** Configurația NextAuth din `/app/api/auth/[...nextauth]/route.ts`, provider-ul Google.
- **Problemă:** Utilizatorii existenți în baza de date (creați anterior prin alte metode) nu se puteau autentifica cu Google OAuth din cauza erorii "OAuthAccountNotLinked". NextAuth.js nu permite implicit legarea automată a conturilor cu același email din motive de securitate.
- **Soluție Temporară:**
    1. S-a adăugat parametrul `allowDangerousEmailAccountLinking: true` în configurația GoogleProvider.
    2. Aceasta permite legarea automată a conturilor cu același email, eliminând eroarea "To confirm your identity, sign in with the same account you used originally."
- **Status:** Suspendat temporar - PERICULOS în producție.
- **Plan de Acțiune Viitor:** Înaintea deployment-ului în producție, se va implementa una dintre soluțiile sigure:
    1. Pagină custom de error care explică utilizatorului să folosească provider-ul original
    2. Eliminarea Credentials Provider și folosirea exclusiv a OAuth providers
    3. Reset complet al bazei de date pentru a elimina conflictele de conturi
    4. Implementarea unui sistem de linking manual și sigur a conturilor

---

## Probleme de Securitate - URGENT

### 1. OAuthAccountNotLinked Error - SOLUTIE TEMPORARA NESIGURA
**Problema**: Utilizatorii cu conturi existente în baza de date nu se pot loga cu Google OAuth din cauza măsurii de securitate NextAuth.

**Soluție temporară aplicată**:
```javascript
allowDangerousEmailAccountLinking: true
```

**RISC**: Această setare permite preluarea conturilor prin atacuri de tip email hijacking.

**DE FĂCUT URGENT în producție**:
1. Implementarea unui sistem de linking sigur
2. Verificarea identității înainte de linking
3. Notificări email pentru linking-uri noi
4. Oprirea acestei setări temporare

---

## Actualizări Aplicație - 16.06.2024

### 2. Eliminare Auto-Refresh Marketplace
**Modificare**: Am eliminat refresh-ul automat la fiecare 10 secunde din marketplace.

**Motivul**: Utilizatorii preferă să facă refresh manual când doresc să vadă actualizările.

**Comportament actual**:
- Marketplace se actualizează doar la refresh manual
- Marfa ștearsă dispare pentru alți utilizatori doar când fac refresh manual
- Performanță îmbunătățită (mai puține cereri către server)
- Control complet al utilizatorului asupra când să vadă actualizările

**Commit**: `1a179c0` - "Remove auto-refresh from marketplace - users will refresh manually when needed"

---

## De urmărit în continuare:
- Rezolvarea problemei de securitate OAuth
- Testarea comportamentului fără auto-refresh în utilizare reală 