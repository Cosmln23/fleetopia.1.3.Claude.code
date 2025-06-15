# Jurnal de Capabilități - Agent Dispecer AI

Acest document descrie funcționalitățile și capabilitățile agentului AI dezvoltat pentru optimizarea deciziilor de dispecerat.

## Versiune Curentă: 1.0

### Viziune Generală
Agentul monitorizează în timp real noile oferte de marfă și analizează flota de vehicule disponibile pentru a propune cea mai eficientă și profitabilă asignare.

---

### Capabilități Implementate

#### 1. Monitorizare și Detectare
- **Monitorizare Piață:** Agentul interoghează periodic sistemul pentru a detecta ofertele de marfă nou adăugate (cu statusul `NEW`).
- **Activare prin Alertă:** La apariția unei oferte noi, se generează o alertă internă care declanșează procesul de analiză al agentului.

#### 2. Analiză și Simulare
- **Identificare Candidați:** Agentul filtrează și identifică toate vehiculele din flotă care sunt disponibile (`status: idle`) și potrivite pentru tipul de transport cerut de ofertă (ex: `duba`, `camion`).
- **Calcul Rută și Distanță:** Pentru fiecare vehicul-candidat, agentul folosește Google Maps API pentru a calcula ruta optimă și distanța totală. Acest calcul ia în considerare 3 puncte:
    1.  Locația curentă a vehiculului.
    2.  Adresa de încărcare a mărfii.
    3.  Adresa de destinație finală.
- **Estimare Cost Combustibil:** Agentul calculează costul estimat al combustibilului pentru întreaga cursă. Calculul se bazează pe:
    - Distanța totală calculată.
    - Câmpul `fuelConsumption` (L/100km) specific fiecărui vehicul din baza de date.
    - Un preț predefinit per litru de combustibil.
- **Calcul Profitabilitate:** Agentul determină profitul estimat pentru fiecare scenariu (vehicul-candidat) scăzând costul de combustibil din prețul total al ofertei.

#### 3. Decizie și Propunere
- **Selecția Celui Mai Bun Candidat:** Dintre toate scenariile simulate, agentul îl alege pe cel care oferă cel mai mare profit.
- **Inteligență Decizională (Profit vs. Pierdere):**
    - **Dacă profitul este pozitiv:** Agentul instruiește modelul Claude AI să formuleze o propunere de asignare, justificând alegerea pe baza profitului maxim.
    - **Dacă profitul este negativ:** Agentul instruiește modelul Claude AI să formuleze o **avertizare**, subliniind că respectiva cursă este neprofitabilă și recomandând respingerea ofertei sau renegocierea prețului. În acest caz, nu se asignează niciun vehicul.
- **Generare Limbaj Natural:** Propunerea finală (fie de acceptare, fie de respingere) este generată de Claude AI pentru a fi clară, profesională și ușor de înțeles pentru un operator uman.

#### 4. Acțiune și Integrare Sistem
- **Prezentare Propunere:** Propunerea generată de AI este afișată în interfața de administrare, în secțiunea "AI Agents".
- **Acceptare Manuală:** Operatorul uman are decizia finală și poate apăsa butonul "Accept".
- **Execuție Asignare:** La acceptare, sistemul:
    - Schimbă statusul ofertei în `TAKEN`.
    - Schimbă statusul vehiculului în `ASSIGNED`.
    - Creează o nouă `Route` în baza de date, legând oferta de vehicul.
    - Toate aceste operațiuni sunt executate într-o tranzacție atomică pentru a garanta integritatea datelor.

---
Acest jurnal va fi actualizat pe măsură ce noi funcționalități vor fi adăugate. 