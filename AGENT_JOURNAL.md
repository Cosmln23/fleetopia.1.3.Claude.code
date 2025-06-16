# Jurnal de Dezvoltare Agent AI - v1.2 -> v1.3 (Sistem Hibrid de Localizare)

Acest document detaliază evoluția agentului AI de la o versiune cu calcul de bază la un sistem avansat, capabil să gestioneze multiple tipuri de localizare pentru vehicule, depanare critică și îmbunătățiri semnificative de interfață și transparență.

### Partea 1: Îmbunătățirea Inteligenței și Transparenței Agentului

*   **Problemă Inițială:** Agentul AI calcula distanțe confuze (nu era clar cât este până la punctul de încărcare vs. cursa în sine) și nu lua în calcul costul potențial al vinietelor, subestimând costurile totale.
*   **Soluția pentru Distanță:** Logica API-ului (`app/api/ai/analyze-cargo-offer/route.ts`) a fost modificată pentru a solicita și procesa segmentele individuale ale rutei ("legs") de la Google Routes API. Acest lucru a permis separarea clară a distanței de la locația vehiculului la punctul de încărcare (`distanceToPickup`) de distanța cursei propriu-zise (`distanceOfCargo`). Interfața a fost actualizată pentru a afișa această defalcare detaliată, oferind transparență totală utilizatorului.
*   **Soluția pentru Viniete:** Deoarece API-ul Google nu poate calcula costul vinietelor, agentul a fost făcut mai "deștept". Prompt-ul trimis către Claude AI a fost îmbunătățit pentru a include o instrucțiune specifică: dacă ruta tranzitează țări cunoscute pentru viniete (ex: Austria, Ungaria), AI-ul trebuie să adauge o "notă de prudență" în propunerea sa textuală, avertizând utilizatorul despre acest cost suplimentar.

### Partea 2: Depanare Critică și Refactorizare Majoră a Interfeței

*   **Erori `500` și `Cargo offer not found`:** După primele modificări, au apărut o serie de erori critice.
    1.  Un `500 Internal Server Error` a fost cauzat de o presupunere greșită în cod, care se aștepta ca API-ul Google să returneze mereu două segmente de rută. Când un vehicul era deja la locația de încărcare, API-ul returna un singur segment, cauzând un crash. Acest lucru a fost rezolvat prin adăugarea de logică robustă care verifică numărul de segmente înainte de a le procesa.
    2.  O eroare `Cargo offer not found` a apărut deoarece interfața trimitea ID-ul alertei (`alert.id`) către backend, în loc de ID-ul ofertei de marfă, care era stocat în `alert.relatedId`.
*   **Refactorizarea Interfeței (`app/ai-agents/page.tsx`):** În timpul depanării, s-a descoperit o problemă majoră de stare în componentă, care împiedica afișarea panoului de analiză după finalizarea calculului. Soluția a fost o refactorizare completă a stării, implementând o stare per-alertă (`alertStates`) care gestionează statusul (`thinking`, `analyzed`), propunerea și defalcarea pentru fiecare alertă în parte.
*   **Probleme de Mediu:** Pe parcurs, au fost rezolvate și probleme de mediu, cum ar fi erori de sintaxă cauzate de cache-ul corupt al serverului Next.js (rezolvate prin ștergerea folderului `.next`).

### Partea 3: Implementarea Sistemului Hibrid de Localizare

*   **Ideea Strategică:** Implementarea unui sistem flexibil de adăugare a vehiculelor, pentru a acoperi atât flotele profesionale (cu GPS), cât și pe cele fără sisteme GPS centralizate.
*   **Planul de Implementare:**
    1.  **Baza de Date:** Schema Prisma (`prisma/schema.prisma`) a fost modificată. La modelul `Vehicle` s-a adăugat un `enum` `VehicleLocationType` (`MANUAL_COORDS`, `MANUAL_ADDRESS`, `GPS_API`) și câmpurile corespunzătoare (`manualLocationAddress`).
    2.  **Backend:** Agentul AI din `app/api/ai/analyze-cargo-offer/route.ts` a fost modificat fundamental. Acum, înainte de a calcula rute, iterează prin vehiculele candidate. Dacă un vehicul are `locationType: 'MANUAL_ADDRESS'`, agentul folosește API-ul de Geocoding de la Google pentru a transforma adresa (ex: "București") în coordonate `lat`/`lng`. Doar vehiculele cu coordonate valide sunt folosite în simulare.
    3.  **Frontend:** Formularul `components/add-vehicle-form.tsx` a fost transformat într-unul dinamic. Un selector pentru "Location Method" permite utilizatorului să aleagă tipul de localizare, iar formularul afișează condiționat doar câmpurile relevante (fie `lat`/`lng`, fie câmpul pentru adresă).

**Rezultat Final:** Un sistem funcțional, robust și semnificativ mai inteligent, cu toate modificările salvate în fișierele corespunzătoare. Progresul este acum documentat, iar codul este gata pentru a fi revizuit și publicat pe Git. 