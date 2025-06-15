# Plan de Acțiune: Activarea Dispecerului AI (15 Iunie 2024)

Acest document detaliază pașii pentru a transforma pagina `/ai-agents` într-un centru de comandă funcțional, permițând unui AI (simulat inițial) să analizeze alerte de sistem și să propună acțiuni.

---

### **Pasul 1: Construim "Ochii" AI-ului (Afișarea Alertelor)** - ⏳ **În Curs**

*   **Sub-obiectiv:** Transformăm pagina statică `/ai-agents` într-un centru de comandă dinamic care afișează alertele din sistem în timp real.
*   **Acțiuni:**
    1.  Modificarea paginii `app/ai-agents/page.tsx`.
    2.  Implementarea unei funcții `useEffect` care va face un apel `fetch` la API-ul existent (`/api/dispatcher/alerts`) pentru a prelua lista de alerte.
    3.  Afișarea alertelor sub formă de carduri, conținând informații clare (tip, rezumat).
    4.  Adăugarea unui buton inactiv **"Analyze & Propose"** pe fiecare card de alertă.

---

### **Pasul 2: Construim "Logica" AI-ului (Backend-ul de Analiză)** - 📋 **De Făcut**

*   **Sub-obiectiv:** Creăm un endpoint API care poate lua o alertă, o poate "înțelege" și o poate trimite unui model de limbaj pentru analiză.
*   **Acțiuni:**
    1.  Crearea unui nou fișier API: `app/api/ai/analyze-cargo-offer/route.ts`.
    2.  Endpoint-ul va accepta o cerere `POST` cu `cargoOfferId`.
    3.  Logica internă:
        a. Preluarea detaliilor ofertei de marfă din DB.
        b. Preluarea listei de vehicule disponibile (`idle`) din DB.
        c. Formatarea datelor într-un "prompt" text.
    4.  **Simularea răspunsului AI:** Endpoint-ul va returna un răspuns JSON predefinit, de ex: `{"proposal": "Propunere SIMULATĂ: Alocă vehiculul X."}`.

---

### **Pasul 3: Conectăm "Ochii" la "Logică" (Activarea Butonului)** - 📋 **De Făcut**

*   **Sub-obiectiv:** Facem butonul "Analyze & Propose" funcțional.
*   **Acțiuni:**
    1.  Revenirea la pagina `app/ai-agents/page.tsx`.
    2.  Adăugarea unei stări (`useState`) pentru a memora propunerea generată de AI.
    3.  Implementarea funcționalității butonului pentru a apela API-ul de la Pasul 2.
    4.  Afișarea răspunsului (simulat) de la API într-un card de "Propunere AI" sub alerta corespunzătoare.

--- 