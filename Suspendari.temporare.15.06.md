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