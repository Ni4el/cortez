# MASTER PROMPT — portfolio i sprzedaż dzieł jednego artysty

## Rola i sposób użycia

Jesteś Codexem pracującym nad stroną internetową portfolio i sprzedaży dzieł **jednego artysty**. Ten dokument jest główną specyfikacją produktu. Traktuj go jako źródło wymagań i wracaj do niego podczas planowania, implementacji i przeglądu zmian. Gdy repozytorium zawiera dodatkowe, nowsze ustalenia użytkownika, uwzględnij je i wyjaśnij ewentualne konflikty.

Nie wymyślaj nazwy artysty, jego biografii, tytułów ani opisów dzieł, cen, wymiarów, materiałów, dostępności, danych kontaktowych, polityk prawnych ani treści produkcyjnych. Brakujące informacje przedstawiaj jako pola do uzupełnienia albo pytaj wyłącznie wtedy, gdy decyzja blokuje bezpieczną implementację. Nie publikuj placeholderów jako prawdziwych danych.

## Cel produktu

Zbuduj elegancką, szybką i dostępną stronę, która:

- prezentuje twórczość jednego artysty w katalogu obejmującym dzieła dostępne, zarezerwowane, sprzedane, podarowane i niepubliczne;
- pozwala zwiedzać galerię za pomocą zwykłych, statycznych zdjęć lub grafik pomieszczeń z klikalnymi hotspotami;
- pokazuje każde dzieło w osobnym statycznym ujęciu na ścianie, a następnie pozwala otworzyć zdjęcie wysokiej rozdzielczości do oglądania detali;
- umożliwia zakup wybranych dzieł bezpośrednio online albo wysłanie zapytania o dzieło;
- zapewnia artyście bezpieczny panel do zarządzania dziełami, zdjęciami, salami i zamówieniami/zapytaniami.

Najważniejsze są wierna prezentacja sztuki, prostota obsługi oraz wiarygodny proces kontaktu i zakupu.

## Bezwzględne granice rozwiązania

Interaktywna galeria jest doświadczeniem **2D opartym wyłącznie na statycznych obrazach**. Nie implementuj ani nie proponuj:

- 3D, scen 3D, silników 3D, Three.js, React Three Fiber ani WebGL do renderowania przestrzeni;
- Blendera, modeli 3D, GLB/GLTF ani pipeline'u modelowania;
- panoram 360°, widoków sferycznych lub equirectangular;
- Pannellum, viewerów panoramicznych ani ekwiwalentów;
- obracania, przesuwania lub rozglądania się po zdjęciu sali jak po panoramie.

Nie zmieniaj tej decyzji w ramach refaktoryzacji ani z własnej inicjatywy. Ruch i przejścia mogą być lekkie i dekoracyjne, ale scena pozostaje nieruchomym zdjęciem. Nie stosuj efektu, który sugeruje obracanie kamery.

## Proponowany stack

Preferowany stack projektu:

- Next.js (App Router, jeśli repozytorium nie uzasadnia innego podejścia);
- TypeScript;
- React;
- CSS zgodny z istniejącymi konwencjami projektu (CSS Modules, Tailwind lub istniejący system komponentów — nie wprowadzaj nowego bez potrzeby);
- Supabase: Postgres, Storage, a w razie potrzeby Auth;
- Vercel do hostingu i wdrażania.

Najpierw sprawdź istniejące repozytorium. Traktuj powyższy stack jako kierunek, nie uzasadnienie do przebudowy działającej aplikacji. Zachowuj istniejące rozwiązania, jeśli spełniają wymagania.

## Struktura serwisu

Docelowe obszary (nazwy tras dopasuj do konwencji repozytorium):

1. **Strona główna** — mocna prezentacja twórczości, wybrane dzieła, wejście do galerii, katalogu i informacji o artyście. Treści pochodzą z danych zatwierdzonych przez artystę.
2. **Galeria** — wybór sali i nawigacja między statycznymi widokami pomieszczeń.
3. **Katalog dzieł** — filtrowalna lista dzieł publicznych, z widocznym statusem sprzedaży i jasną drogą do zakupu lub zapytania.
4. **Szczegóły dzieła** — osobna strona dla publicznego dzieła; prezentacja obrazu, informacji, statusu, ceny (jeśli zatwierdzona) i dostępnej akcji.
5. **O artyście** — biografia i materiały wyłącznie dostarczone lub zatwierdzone przez artystę.
6. **Kontakt** — zatwierdzone kanały kontaktu i/lub formularz.
7. **Koszyk i checkout** — tylko jeśli skonfigurowano bezpośrednią sprzedaż oraz operatora płatności.
8. **Strony informacyjne** — dostawa, zwroty, prywatność, regulamin i inne wymagane treści. Nie twórz fikcyjnych polityk; oznacz ich przygotowanie jako blokadę uruchomienia handlu, jeśli są wymagane.
9. **Panel administracyjny** — uwierzytelnione zarządzanie treścią i obsługą sprzedaży.

## Interaktywna galeria — wymagany przebieg

### Widok sali

- Każda sala jest pojedynczym, zwykłym statycznym zdjęciem/grafiką, skalowanym responsywnie w wyznaczonym obszarze.
- Na obrazie znajdują się konfigurowalne hotspoty przypisane do dzieł albo przejść/drzwi.
- Hotspoty są dostępne jako elementy interaktywne z czytelną nazwą dla czytników ekranu i obsługą klawiaturą. Widoczne etykiety lub podpowiedzi mogą pojawić się po najechaniu/fokusie; na dotyku muszą być zrozumiałe bez hovera.
- Pozycje hotspotów zapisuj w jednostkach niezależnych od rozmiaru (np. procenty względem obrazu), tak aby dopasowywały się do responsywnego kadru. Dopilnuj, by geometria pozycjonowania odpowiadała rzeczywistemu obszarowi widocznego obrazu przy `object-fit`.
- Kliknięcie hotspotu dzieła otwiera osobny statyczny widok tego dzieła na ścianie.
- Kliknięcie hotspotu drzwi/przejścia otwiera przypisaną kolejną salę. Nawigacja nie może zakładać, że wszystkie sale tworzą liniowy ciąg.

### Widok dzieła na ścianie

- Pokazuje osobne statyczne zdjęcie dzieła na ścianie, jeśli dostarczono takie zdjęcie. To ujęcie nie jest wycinane z panoramy i nie jest sceną 3D.
- Wyświetla zatwierdzone informacje o dziele i jego statusie, a także właściwą akcję sprzedaży lub zapytania.
- Zapewnia widoczną strzałkę powrotu do poprzedniego kontekstu galerii. Powrót ma działać również przez historię przeglądarki; bezpieczny fallback prowadzi do sali źródłowej lub strony galerii.
- Kliknięcie obrazu albo jednoznaczny przycisk „Powiększ” otwiera widok zoomu. Nie uzależniaj krytycznej funkcji wyłącznie od przypadkowego kliknięcia obrazu.

### Widok powiększenia

- Używa osobnego pliku wysokiej rozdzielczości przygotowanego do prezentacji detali; nie powiększaj jedynie małej miniatury.
- Pozwala oglądać detale poprzez responsywne powiększenie lub prostą kontrolę zoomu. Jeśli dostępne jest przesuwanie powiększonego obrazu, musi być obsługiwane dotykiem, myszą i klawiaturą.
- Udostępnia jasny sposób zamknięcia/powrotu do widoku dzieła; obsłuż klawisz Escape, jeśli widok działa jak modal.
- Zachowuje opis alternatywny i nie blokuje powrotu ani podstawowych informacji o dziele.

## Katalog dzieł i statusy

Oddziel **status transakcyjny dzieła** od **publicznej widoczności**. Dzieło może mieć status `sold`, a jednocześnie być publicznie widoczne w katalogu. Dzieło `private` nie staje się publiczne tylko dlatego, że ktoś zna jego adres.

Obsługiwane statusy transakcyjne:

- `available` — dostępne;
- `reserved` — zarezerwowane;
- `sold` — sprzedane;
- `gifted` — podarowane;
- `private` — status biznesowy „prywatne”, zgodnie z potrzebą artysty.

Widoczność publiczna powinna być osobnym, jawnym polem, np. `is_published` / `visibility` (`public`, `unlisted`, `private`). Określ zasady mapowania statusu i widoczności w interfejsie; nie wyświetlaj dzieł nieopublikowanych w publicznych listach, wyszukiwaniu ani sitemapie. Status `private` oraz widoczność prywatna to różne pojęcia i mogą współistnieć.

Katalog powinien:

- prezentować publiczne dzieła w spójnym układzie i udostępniać podstawowe filtrowanie (np. status, kolekcja/medium tylko jeśli dane istnieją);
- pokazywać sprzedane i podarowane dzieła jako część dorobku, o ile artysta opublikuje je publicznie;
- nie sugerować możliwości zakupu dzieła, które nie ma statusu `available`;
- nie ujawniać niezatwierdzonych cen, danych nabywców ani wewnętrznych notatek.

## Mieszany model sprzedaży

Każde publiczne dzieło może być przeznaczone do jednego z trybów:

1. **Zakup bezpośredni** — wyłącznie dla dzieł dostępnych, z zatwierdzoną ceną/walutą, konfiguracją dostawy i skonfigurowanym dostawcą płatności. Zbieraj tylko dane niezbędne do realizacji zamówienia. Potwierdzenie zamówienia nie może być utożsamiane z potwierdzeniem płatności bez wiarygodnego potwierdzenia od operatora.
2. **Zapytanie o dzieło** — formularz dla dzieł dostępnych lub w innym stanie, jeśli artysta tak zdecyduje. Automatycznie dołącz identyfikator dzieła; pozwól użytkownikowi podać wiadomość i wymagane minimum danych kontaktowych. Potwierdź wysłanie i pokaż dalszy zatwierdzony sposób kontaktu.

Tryb sprzedaży ustawiaj per dzieło lub według jawnych reguł. Rezerwacja, jeśli zostanie zaimplementowana, musi mieć określony czas/warunki i nie może wynikać z samego otwarcia checkoutu. Zapobiegaj podwójnej sprzedaży przez serwerowe sprawdzenie dostępności i atomową zmianę/rezerwację stanu przy składaniu zamówienia. Płatności integruj po stronie serwera przez sprawdzone webhooki; klucze sekretne nie mogą trafić do klienta.

## Kierunek UX/UI

- Ciemny, kinowy styl: grafitowe/czarne tło, kontrolowane ciepłe światło, spokojna typografia i dużo miejsca dla dzieła.
- Obraz jest głównym elementem. Interfejs, ramki, cienie, animacje i dekoracje nie mogą konkurować z pracą.
- Używaj subtelnych przejść, krótkich czasów i respektuj `prefers-reduced-motion`.
- Tekst, przyciski, statusy i hotspoty muszą mieć czytelny kontrast. Kolor nie może być jedynym nośnikiem statusu.
- Projektuj mobile-first, ale zapewnij dopracowane kadrowanie i nawigację na telefonie, tablecie i dużym ekranie. Na małych ekranach hotspoty muszą mieć praktyczny obszar dotyku; nie umieszczaj kontrolek poza bezpiecznym viewportem.
- Zapewnij widoczne stany hover, focus, pressed, loading, empty i error.
- Nie zakładaj, że użytkownik ma mysz. Wszystkie funkcje działają przez klawiaturę i dotyk.

## Model danych — punkt wyjścia

Dopasuj nazwy i normalizację do repozytorium. Minimalny model powinien rozdzielać treść, media, widoczność, sprzedaż i relacje galerii.

### `artworks`

- `id` (stabilny identyfikator), `slug`;
- `title`, `description` (opcjonalne do czasu dostarczenia treści), `year`, `medium`, `dimensions` — tylko zweryfikowane dane;
- `status` z określonego zbioru statusów;
- `visibility` / `is_published` niezależne od statusu;
- `sale_mode` (np. direct, inquiry, none), `price`, `currency` — opcjonalne i tylko zatwierdzone;
- powiązania do plików: miniatura, widok na ścianie, zdjęcie wysokiej rozdzielczości, tekst alternatywny;
- znaczniki czasu i, jeśli potrzebne, autor zmian.

### `rooms` i `room_hotspots`

- Sala: `id`, `slug`, zatwierdzona nazwa/etykieta (opcjonalna), statyczne zdjęcie, kolejność/stan publikacji.
- Hotspot: `id`, `room_id`, typ (`artwork` albo `room`), pozycja/rozmiar względem obrazu w znormalizowanych jednostkach, dostępna etykieta, oraz dokładnie jedno docelowe `artwork_id` lub `target_room_id`.
- Waliduj relacje, granice współrzędnych oraz istnienie opublikowanego celu przy publikacji sali.

### `media_assets`

Przechowuj ścieżki/klucze Supabase Storage, typ roli, typ MIME, wymiary/rozmiar jeśli dostępne, tekst alternatywny, status publikacji i relację do dzieła lub sali. Oryginały wysokiej rozdzielczości mogą wymagać ograniczonego dostępu lub kontrolowanego dostarczania; publiczne miniatury nie powinny odsłaniać danych prywatnych.

### `inquiries` i `orders`

- Zapytanie: dzieło, niezbędne dane kontaktowe, wiadomość, status obsługi, daty; ogranicz dostęp do administratorów.
- Zamówienie: dzieło/pozycje, kwoty i waluta zapisane jako migawka w momencie zamówienia, status zamówienia i płatności, identyfikatory operatora, dane realizacyjne niezbędne do dostawy, daty. Nie przechowuj danych karty.
- Zdefiniuj dozwolone przejścia statusów, deduplikację webhooków i obsługę błędów płatności.

Przygotuj migracje schematu, ograniczenia/indeksy i polityki dostępu jako kod wersjonowany w repozytorium. Nie zakładaj ani nie publikuj realnych rekordów produkcyjnych.

## Panel administracyjny

Panel dostępny wyłącznie dla uprawnionych osób. Minimalne możliwości:

- logowanie i zarządzanie sesją;
- tworzenie/edycja dzieł, statusu, widoczności i trybu sprzedaży;
- wgrywanie oraz przypisywanie miniatur, zdjęć na ścianie i plików wysokiej rozdzielczości;
- zarządzanie salami i pozycjami hotspotów, w tym wybór celu dzieła/przejścia;
- podgląd przed publikacją, walidacja brakujących obrazów/altów i niepoprawnych celów;
- obsługa zapytań i zamówień bez ujawniania ich publicznie;
- potwierdzenie przed publikacją lub zmianą o istotnych skutkach.

Zastosuj zasadę najmniejszych uprawnień. Publiczny klient nie może modyfikować danych ani odczytywać zapytań, zamówień, prywatnych dzieł lub niepublicznych plików. Reguły RLS i konfigurację Storage projektuj zgodnie z rolami i stanem publikacji.

## SEO i udostępnianie

- Renderuj indeksowalne strony dzieł i kluczowe treści po stronie serwera tam, gdzie pasuje to do architektury.
- Używaj stabilnych, czytelnych adresów URL i metadanych per publiczna strona.
- Dodaj poprawne tytuły/opisy, canonicale, Open Graph i sitemapę tylko dla treści publicznych.
- Dzieła prywatne, nieopublikowane i dane panelu wyklucz z indeksowania oraz sitemap.
- Używaj danych strukturalnych tylko wtedy, gdy są zgodne z rzeczywistymi, zatwierdzonymi informacjami; nie generuj fikcyjnych cen ani dostępności.

## Dostępność

Celuj w WCAG 2.2 AA w kluczowych przepływach. Zapewnij semantyczny HTML, logiczną kolejność fokusu, widoczny fokus, etykiety kontrolek, komunikaty błędów przy polach, poprawne nagłówki, teksty alternatywne, kontrast i obsługę klawiaturą. Hotspoty muszą mieć dostępne nazwy i nie mogą być jedynym sposobem dotarcia do dzieła — udostępnij także listę dzieł sali. Zoom i modale muszą mieć poprawny fokus i sposób zamknięcia. Nie wpisuj automatycznie wymyślonych opisów alternatywnych; umożliwiaj ich zatwierdzenie przez artystę.

## Bezpieczeństwo i prywatność

- Nigdy nie umieszczaj kluczy serwisowych, sekretów płatności ani poświadczeń administratora w kodzie klienta lub repozytorium.
- Używaj zmiennych środowiskowych, walidacji po stronie serwera, kontroli uprawnień i Supabase RLS.
- Waliduj i ograniczaj przesyłane pliki (typ, rozmiar, nazwa/ścieżka); nie ufaj metadanym od klienta.
- Zabezpiecz formularze przed nadużyciami: walidacja, ograniczanie częstotliwości i ochrona przed automatycznym spamem adekwatna do wdrożenia.
- Minimalizuj dane osobowe, ogranicz ich retencję do zatwierdzonej polityki i nie loguj ich ani sekretów.
- Nie wykonuj checkoutu ani nie pokazuj przycisku zakupu, dopóki konfiguracja płatności, dostawy i wymagane informacje prawne nie są gotowe.
- Dokumentuj wymagane zmienne środowiskowe przykładowymi nazwami bez prawdziwych sekretów.

## Wydajność i media

- Używaj responsywnych wariantów obrazów i nowoczesnych formatów, gdy pipeline na to pozwala.
- Ładuj miniatury w katalogu; zdjęcie wysokiej rozdzielczości pobieraj dopiero przy wejściu w zoom.
- Ustal rozsądne wymiary, kompresję i limity uploadu. Nie serwuj niepotrzebnie oryginałów.
- Zapobiegaj przesunięciom layoutu, podawaj wymiary/aspect ratio i stosuj lazy loading poza krytycznym widokiem.
- Dbaj o szybkie działanie na urządzeniach mobilnych i wolniejszych łączach; stan ładowania oraz błąd mediów muszą być zrozumiałe.

## Integracje

Integruj wyłącznie po potwierdzeniu potrzeb i konfiguracji:

- Supabase Postgres, Storage, Auth (jeśli panel tego wymaga);
- Vercel dla wdrażania i konfiguracji środowisk;
- operator płatności dla bezpośredniego zakupu;
- opcjonalna poczta transakcyjna dla potwierdzeń zapytań/zamówień;
- analityka z poszanowaniem prywatności i wymaganych zgód.

Nie zakładaj konkretnego operatora, dostawcy poczty, waluty ani regionu prawnego bez danych od użytkownika. Ukrywaj funkcje zależne od niekonfigurowanej integracji.

## MVP i plan etapowy

### Etap 0 — rozpoznanie i decyzje

- zbadaj repozytorium, instrukcje, zależności, konwencje, istniejące strony i stan testów;
- wskaż, które elementy już istnieją i jak można je rozszerzyć;
- wypisz wyłącznie decyzje blokujące (np. dostawca płatności, jeśli ma ruszyć checkout, albo brak prawdziwych materiałów potrzebnych do publikacji).

### Etap 1 — fundament i prezentacja

- szkielet na istniejącym stacku, nawigacja, responsywny ciemny styl;
- strona główna, katalog i szablon szczegółów dzieła z danymi typowanymi;
- brak fikcyjnych produkcyjnych dzieł — można używać jawnych fixture'ów demonstracyjnych tylko w testach/Storybooku i oznaczyć je jako przykładowe.

### Etap 2 — galeria 2D

- statyczne sale, hotspoty dzieł i przejść, lista dostępnych dzieł sali;
- widok dzieła na ścianie, powrót i zoom z pliku wysokiej rozdzielczości;
- obsługa dotyku, klawiatury, historii przeglądarki i pustych/brakujących mediów.

### Etap 3 — zarządzanie treścią

- migracje Supabase, bezpieczne zasady dostępu, Storage;
- panel dzieł, mediów, sal i hotspotów;
- walidacja oraz podgląd przed publikacją.

### Etap 4 — zapytania i sprzedaż

- formularz zapytania oraz administracyjna obsługa;
- następnie checkout, jeśli dostarczono wymagania, operatora płatności, dostawy i zatwierdzone treści prawne;
- serwerowe potwierdzanie płatności i odporność na ponowienia.

### Etap 5 — jakość i uruchomienie

- SEO, dostępność, wydajność, bezpieczeństwo, analityka (jeśli zatwierdzona);
- weryfikacja środowisk, migracji, kopii zapasowych i procesu publikacji;
- końcowa lista rzeczy wymagających dostarczenia przez artystę.

## Zasady pracy dla Codex

1. **Najpierw zbadaj istniejące repozytorium**: instrukcje (`AGENTS.md`), strukturę, framework, zależności, style, komponenty, testy i aktualny stan git.
2. **Przestrzegaj instrukcji projektu** oraz jego konwencji. Traktuj katalogi i pliki oznaczone jako źródłowe lub zsynchronizowane jako read-only.
3. **Nie nadpisuj istniejących rozwiązań bez uzasadnienia.** Przed większą zmianą wyjaśnij, jaki konkretny wymóg jej wymaga; preferuj małe, zgodne rozszerzenia.
4. **Pracuj małymi etapami**. Wprowadzaj spójne, przeglądalne zmiany i po każdym etapie podsumuj rezultat.
5. Nie dodawaj prawdziwych nazw, biografii, prac, cen, danych kontaktowych, polityk ani innych **fikcyjnych danych produkcyjnych**. Jeśli potrzebny jest materiał do interfejsu, używaj pustych stanów lub jawnie testowych fixture'ów poza produkcją.
6. **Pytaj tylko o decyzje blokujące.** W pozostałych przypadkach przyjmuj bezpieczne i odwracalne założenia, zapisz je i kontynuuj.
7. Dla zmian kodu uruchamiaj odpowiednie testy, lint i build, gdy są skonfigurowane; naprawiaj problemy wprowadzone przez zmianę. Nie deklaruj uruchomienia polecenia, którego nie wykonano. Jeśli wymaganie użytkownika lub środowiska uniemożliwia weryfikację, podaj to jasno.
8. Przed zakończeniem przejrzyj diff pod kątem przypadkowych zmian, sekretów, błędów dostępności, widoczności prywatnych danych i zgodności z granicami 2D.
9. Raportuj: co zostało zrobione, **które pliki zmieniono**, jakie kontrole uruchomiono z wynikiem oraz jakie zadania lub decyzje pozostały.

## Kryteria akceptacji

- Użytkownik może przejść z sali do dzieła, z dzieła do zoomu, wrócić strzałką oraz przejść przez hotspot drzwi do innej sali.
- Galeria używa wyłącznie statycznych obrazów i hotspotów; nie zawiera panoram, obrotu ani technologii/zasobów 3D.
- Katalog obsługuje dzieła sprzedane i inne wymagane statusy, a status transakcyjny jest niezależny od publicznej widoczności.
- Akcja zakupu pojawia się tylko dla prawidłowo skonfigurowanego dzieła dostępnego; pozostałe przypadki kierują do zapytania lub informują o statusie.
- Panel i backend nie ujawniają niepublicznych rekordów, zapytań, zamówień ani sekretów.
- Interfejs jest responsywny, dostępny klawiaturą/dotykiem i ma obsługę błędów oraz pustych stanów.
- Nie ma zmyślonych danych produkcyjnych, a końcowy raport jasno wymienia zmienione pliki, przeprowadzone kontrole i pozostałe zadania.
