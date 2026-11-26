# Implementacja automatycznej synchronizacji obrazów z AHG36

## 1. Cel

Zaimplementuj automatyczny system synchronizacji dostępności obrazów z platformy AHG36 z naszą bazą Supabase.

Źródło:
https://www.ahg36.com/shop-online/?artist=Zbigniew+Cortez+Zaj%C4%85c

Synchronizacja ma odbywać się automatycznie raz dziennie, pobierać aktualne dane o obrazach, porównywać je z naszą bazą i aktualizować odpowiednie rekordy.

Dodatkowo system ma generować raport z każdej synchronizacji.

## 2. Zasady biznesowe

### Mapowanie dostępności

| Stan w AHG36 | availability w artworks |
|---|---|
| Obraz dostępny i wystawiony | available |
| Obraz sprzedany (Sold) | sold |
| Obraz niewystępujący w ofercie i archiwum | reserved |
| Obraz występujący w ofercie ze statusem innym niż Sold | available |

Ważne:
- Brak obrazu w aktualnej ofercie nie oznacza automatycznie sprzedaży.
- Obrazy wystawione w AHG36 mają place = "galeria36 Kraków".
- Przy zmianie statusu aktualizuj `artworks.availability`.
- Nie zmieniaj pozostałych pól obrazu bez uzasadnienia.
- Przy braku produktu zachowaj ostatnią znaną cenę i ilość.
- Jeżeli AHG36 nie udostępnia ilości, zapisuj NULL zamiast zgadywać.

## 3. Architektura

Wykorzystaj istniejącą infrastrukturę Supabase:

- Supabase Cron (`pg_cron`) – uruchamianie raz dziennie.
- Supabase Edge Function – pobieranie danych i logika synchronizacji.
- PostgreSQL – przechowywanie danych, historii i raportów.

Nie używaj triggera PostgreSQL do pobierania danych z AHG36.

Zaproponuj uruchamianie synchronizacji codziennie o 06:00 czasu polskiego. Uwzględnij strefę czasową i zmianę czasu letniego/zimowego.

## 4. Struktura bazy danych

Przed implementacją sprawdź aktualny schemat bazy danych i istniejące migracje. Nie zakładaj, że nazwy lub typy kolumn są zgodne z opisem.

### Tabela `artwork_external_sources`

Tabela przechowująca powiązania obrazów z zewnętrznymi platformami.

Kolumny:
- `id` – UUID, PK.
- `artwork_id` – FK do `artworks.id`.
- `source` – identyfikator źródła, np. `ahg36`.
- `external_product_id` – identyfikator produktu w źródle.
- `external_url` – URL produktu.
- `last_seen_at` – ostatni moment znalezienia produktu.
- `last_synced_at` – ostatnia udana synchronizacja.
- `sync_enabled` – czy synchronizować dany obraz.
- `created_at`.
- `updated_at`.

Ograniczenia:
- Unikalność pary (`artwork_id`, `source`).
- Unikalność pary (`source`, `external_product_id`), jeśli external_product_id nie jest NULL.
- Indeksy dla najważniejszych kolumn.
- Odpowiednie FK i polityki RLS.

Nie dodawaj pól integracyjnych do `artworks`.

### Tabela `artwork_external_source_state`

Przechowuj aktualny stan danych pobranych z zewnętrznego źródła.

Kolumny:
- `id`.
- `external_source_id` – FK do `artwork_external_sources.id`.
- `external_status`.
- `external_price`.
- `external_currency`.
- `external_quantity`.
- `last_observed_at`.
- `updated_at`.

Jeden rekord na jedno powiązanie ze źródłem.

Nie nadpisuj ceny i ilości wartością NULL tylko dlatego, że źródło nie udostępniło tych informacji w danym odczycie.

### Tabela `ahg36_sync_runs`

Rejestr każdego uruchomienia synchronizacji.

Kolumny:
- `id`.
- `started_at`.
- `finished_at`.
- `status` – running / success / partial / failed.
- `found_count`.
- `updated_count`.
- `sold_count`.
- `missing_count`.
- `price_changes`.
- `quantity_changes`.
- `error_message`.
- `report_data` – JSONB z podsumowaniem i szczegółami.

### Tabela `artwork_availability_history`

Historia rzeczywistych zmian dostępności, cen i ilości.

Kolumny:
- `id`.
- `artwork_id`.
- `sync_run_id`.
- `change_type` – status / price / quantity.
- `old_value`.
- `new_value`.
- `created_at`.

Zapisuj tylko rzeczywiste zmiany, nie codzienne powtórzenia tych samych danych.

Wszystkie zmiany statusu, ceny i ilości powinny być możliwe do prześledzenia.

## 5. Pobieranie danych z AHG36

Zaimplementuj scraper w Supabase Edge Function.

Wymagania:
1. Pobieraj pełną listę produktów, a nie tylko pierwszą widoczną partię.
2. Obsłuż paginację oraz przycisk Load more.
3. Pobieraj tytuł, identyfikator produktu, URL, status, cenę, walutę, ilość i wymiary, jeśli są dostępne.
4. Sprawdź, czy AHG36 udostępnia osobne archiwum sprzedanych prac autora.
5. Jeśli tak, wykorzystaj archiwum jako dodatkowe źródło potwierdzenia statusu Sold.
6. Zachowaj oryginalne dane źródłowe na potrzeby diagnostyki.

Nie zakładaj struktury HTML bez jej sprawdzenia. Przeanalizuj rzeczywistą stronę, mechanizm paginacji oraz sposób prezentowania statusów.

Nie obchodź zabezpieczeń strony ani nie stosuj metod naruszających jej regulamin.

## 6. Dopasowanie obrazów

Zastosuj następujące priorytety:

1. `external_product_id`.
2. URL produktu.
3. Tytuł + wymiary + autor jako mechanizm pomocniczy.

Nie dopasowuj automatycznie obrazów, jeśli istnieje ryzyko pomyłki.

Niejednoznaczne dopasowania zapisuj jako przypadki wymagające ręcznej weryfikacji.

Nie twórz automatycznie nowych rekordów `artworks`.

## 7. Logika synchronizacji

Przepływ:

1. Utwórz rekord w `ahg36_sync_runs` ze statusem running.
2. Pobierz pełną ofertę AHG36.
3. Pobierz dostępne informacje o sprzedanych obrazach.
4. Zweryfikuj kompletność danych.
5. Dopasuj produkty do rekordów w naszej bazie.
6. Porównaj aktualny stan z poprzednim.
7. Zaktualizuj `artworks.availability`, jeżeli nastąpiła zmiana.
8. Ustaw `artworks.place = 'galeria36 Kraków'` dla obrazów wystawionych w AHG36.
9. Zaktualizuj aktualny stan zewnętrzny.
10. Zapisz historię rzeczywistych zmian.
11. Wygeneruj raport.
12. Zakończ synchronizację odpowiednim statusem.

Wszystkie aktualizacje dotyczące jednego uruchomienia powinny być bezpieczne i możliwie atomowe.

## 8. Obsługa brakujących obrazów

Jeżeli obraz nie występuje w aktualnej ofercie:

- Sprawdź również archiwum sprzedanych obrazów.
- Jeżeli jest potwierdzony jako Sold, ustaw `sold`.
- Jeżeli nie został znaleziony ani w ofercie, ani w archiwum, ustaw `reserved`.
- Zapisz informację o braku produktu.
- Nie usuwaj rekordu obrazu ani jego powiązania ze źródłem.

Jeżeli pobieranie jest niekompletne lub zakończyło się błędem, NIE aktualizuj statusów obrazów na podstawie brakujących wyników.

Nie uznawaj braku obrazu za sprzedaż.

## 9. Zabezpieczenia

Wymagane zabezpieczenia:

- Blokada równoległych synchronizacji.
- Ochrona przed duplikowaniem historii.
- Walidacja kompletności pobranych danych.
- Obsługa timeoutów i błędów HTTP.
- Logowanie błędów.
- Zachowanie ostatnich poprawnych danych po błędzie pobierania.
- Rozróżnienie błędu synchronizacji od poprawnego wyniku z brakującymi produktami.
- Możliwość ręcznego uruchomienia synchronizacji.
- Możliwość wyłączenia synchronizacji dla pojedynczego obrazu.
- Idempotentność procesu.

W przypadku błędu nie aktualizuj masowo statusów.

## 10. Raport dzienny

Raport powinien zawierać:

### Podsumowanie
- Data i czas synchronizacji.
- Status wykonania.
- Liczba produktów znalezionych w AHG36.
- Liczba dopasowanych obrazów.
- Liczba zmienionych statusów.
- Liczba zmian cen.
- Liczba zmian ilości.
- Liczba brakujących obrazów.
- Liczba przypadków wymagających ręcznej weryfikacji.

### Szczegółowe zmiany

Dla każdego zmienionego obrazu:
- Tytuł.
- Poprzedni status i nowy status.
- Poprzednia cena i nowa cena.
- Poprzednia ilość i nowa ilość.
- Link do obrazu w panelu administracyjnym.
- Link do produktu AHG36, jeśli istnieje.

### Dostarczanie raportu

- Zapisuj raport w `ahg36_sync_runs`.
- Udostępnij historię raportów w panelu administracyjnym.
- Przygotuj możliwość wysyłania raportu e-mailem.
- Wysyłaj powiadomienie o błędzie synchronizacji.
- Nie wysyłaj wiadomości bez zmian, chyba że raport podsumowujący został jawnie skonfigurowany.

## 11. Panel administracyjny

Dodaj sekcję zarządzania synchronizacją AHG36.

Powinna umożliwiać:
- Ręczne uruchomienie synchronizacji.
- Wyświetlenie daty ostatniej udanej synchronizacji.
- Wyświetlenie statusu ostatniego uruchomienia.
- Przeglądanie historii synchronizacji.
- Przeglądanie wykrytych zmian.
- Wyświetlanie produktów wymagających ręcznej weryfikacji.
- Włączanie i wyłączanie synchronizacji dla poszczególnych obrazów.

Nie buduj rozbudowanego dashboardu. Zachowaj istniejący design system panelu administracyjnego.

## 12. Harmonogram

Skonfiguruj Supabase Cron:

- Częstotliwość: codziennie.
- Godzina: 06:00 Europe/Warsaw.
- Wywołanie: Supabase Edge Function.
- Zabezpieczenie wywołania odpowiednim sekretem.

Użyj `pg_cron` i mechanizmu HTTP dostępnego w Supabase, np. `pg_net`, zgodnie z aktualną konfiguracją projektu.

Sekrety przechowuj w Supabase Secrets. Nigdy nie umieszczaj kluczy service_role w kodzie frontendowym ani repozytorium.

## 13. Testy

Przygotuj testy dla scenariuszy:

1. Nowy obraz dostępny w AHG36.
2. Obraz zmienia status na Sold.
3. Obraz znika z oferty, ale nie występuje w archiwum.
4. Obraz występuje w archiwum jako Sold.
5. Zmiana ceny.
6. Zmiana ilości.
7. Produkt nie ma dostępnej informacji o ilości.
8. Niejednoznaczne dopasowanie.
9. Niekompletne pobieranie oferty.
10. Błąd HTTP lub timeout.
11. Ponowne uruchomienie tej samej synchronizacji.
12. Próba uruchomienia dwóch synchronizacji jednocześnie.

## 14. Sposób realizacji

Przed rozpoczęciem:
- Przeanalizuj aktualny schemat Supabase.
- Przeanalizuj istniejące modele `artworks` i `availability`.
- Sprawdź aktualne migracje.
- Sprawdź strukturę panelu administracyjnego.
- Sprawdź istniejące mechanizmy autoryzacji i RLS.
- Sprawdź, czy projekt ma już skonfigurowane Supabase Cron i Edge Functions.

Następnie:
1. Zaproponuj migracje.
2. Zaimplementuj Edge Function.
3. Zaimplementuj logikę synchronizacji.
4. Dodaj Cron.
5. Dodaj raportowanie i panel administracyjny.
6. Przygotuj testy.

Nie zmieniaj niezwiązanych elementów aplikacji.

Nie wykonuj migracji produkcyjnych ani nie uruchamiaj harmonogramu produkcyjnego bez uprzedniego sprawdzenia zmian.

Na koniec przedstaw:
- Listę utworzonych i zmodyfikowanych plików.
- Listę migracji.
- Opis działania synchronizacji.
- Instrukcję konfiguracji Supabase Secrets.
- Instrukcję uruchomienia ręcznego.
- Instrukcję aktywacji Cron.
- Wyniki testów.
- Ograniczenia wynikające ze sposobu udostępniania danych przez AHG36.