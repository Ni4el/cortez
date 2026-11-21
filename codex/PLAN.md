Fundament projektu  
- Utworzyć aplikację Next.js + TypeScript (App Router), z prostym systemem stylów zgodnym z ciemnym, kinowym kierunkiem.
- Zdefiniować typy domenowe dzieło, medium, status transakcyjny, widoczność, sala, hotspot, media, zapytanie i zamówienie.
- Przygotować puste, uczciwe stany interfejsu zamiast fikcyjnych danych produkcyjnych.
- Dodać dokumentację wymaganych zmiennych środowiskowych.

Publiczna prezentacja  
- Zbudować strony główna, katalog, szczegóły dzieła, galeria, o artyście i kontakt.
- Katalog będzie pokazywał wyłącznie opublikowane dzieła, z niezależnymi polami status i visibility.
- Akcje sprzedażowe będą zależne od dostępności i konfiguracji — bez przycisku zakupu „na zapas”.

Galeria 2D  
- Wykorzystać istniejące obrazy sal jako responsywne, nieruchome widoki.
- Dodać hotspoty w procentowych współrzędnych, prowadzące do dzieła albo innej sali.
- Zapewnić alternatywną listę dzieł w sali, obsługę klawiatury, dotyku i czytelne etykiety.
- Dla dzieła dodać osobny widok „na ścianie”, przycisk powrotu oraz modalstronę zoomu korzystającą z osobnego pliku hi-res.

Backend i panel  
- Przygotować wersjonowane migracje Supabase tabele, indeksy, ograniczenia, RLS i Storage.
- Zbudować chroniony panel do edycji dzieł, mediów, sal i hotspotów.
- Dodać walidację przed publikacją brak altów, brak mediów, błędne cele hotspotów, niepełne dane sprzedażowe.

Zapytania i sprzedaż  
- Najpierw wdrożyć bezpieczny formularz zapytania o dzieło, z walidacją i ochroną antyspamową.
- Checkout wdrożyć wyłącznie po dostarczeniu operatora płatności, reguł dostawy i zaakceptowanych stron prawnych.
- Obsłużyć płatności serwerowo, przez webhooki oraz atomowe sprawdzanie dostępności dzieła.

Uruchomienie i jakość  
- SEO wyłącznie dla treści publicznych metadata, canonicale, Open Graph i sitemap.
- Audyt WCAG 2.2 AA, responsywności, wydajności mediów, prywatności i bezpieczeństwa.
- Wdrożenie na Vercel po konfiguracji środowisk i Supabase.