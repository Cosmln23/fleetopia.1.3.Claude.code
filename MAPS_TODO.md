# Sarcini de Finalizat pentru Hărți și Rutare

Acest document conține funcționalitățile și îmbunătățirile care au fost amânate pentru a ne concentra pe sarcinile cu prioritate mai mare.

## 1. Sugestii Automate pentru Adrese (Autocomplete)

- **Problemă:** În prezent, utilizatorul trebuie să introducă adresa completă și corectă în "Route Planner". Nu există un sistem de sugestii care să apară pe măsură ce scrie.
- **Soluție Propusă:** Integrarea unui serviciu de geocodificare cu funcție de autocomplete. Acest lucru ar implica:
  - Găsirea unui plugin/serviciu compatibil (ex: `leaflet-geosearch`, sau direct o interogare către API-ul Nominatim/Photon).
  - Modificarea componentei `RouteCalculator` pentru a afișa o listă de sugestii sub câmpul de introducere a textului.
  - La selectarea unei sugestii, se va completa automat câmpul și se vor stoca coordonatele precise.

## 2. Rute Multi-Color pe Segmente

- **Problemă:** În prezent, întreaga rută calculată este afișată cu o singură culoare (violet).
- **Idee:** Modificarea funcționalității astfel încât fiecare segment al rutei (între două opriri) să aibă o culoare diferită.
- **Soluție Propusă:**
  - Investigarea capabilităților `leaflet-routing-machine` pentru a vedea dacă permite stilizarea individuală a segmentelor.
  - Dacă nu, o soluție ar fi să calculăm rute separate pentru fiecare segment (Stop 1 -> Stop 2, Stop 2 -> Stop 3, etc.) și să le adăugăm pe hartă ca straturi separate (`layers`), fiecare cu stilul său de culoare.

## 3. Integrare API Extern (Google Maps / Mapbox)

- **Problemă:** Serviciul gratuit de rutare (OSRM) și geocodificare (Nominatim) are limitări de performanță și acuratețe.
- **Idee:** Permiterea utilizării unor servicii profesionale precum Google Maps sau Mapbox.
- **Soluție Propusă:**
  - Refactorizarea codului de rutare și geocodificare pentru a crea un "adaptor".
  - Crearea unei pagini de setări în care utilizatorul poate introduce propria cheie API pentru serviciul dorit (Google Maps, Mapbox, etc.).
  - Aplicația ar detecta prezența unei chei API și ar comuta automat pe adaptorul corespunzător, oferind rezultate de calitate superioară. 