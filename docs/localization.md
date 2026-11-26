# Języki, tłumaczenia i waluty

Przed uruchomieniem tej wersji zastosuj migrację `202611260001_localization_and_prices.sql`. Przenosi ona istniejące ceny PLN do `artwork_prices`, a następnie usuwa `artworks.price_pln`. Wdrożenie kodu i migracji należy skoordynować, ponieważ poprzednia wersja aplikacji korzysta z usuwanej kolumny.

Migracja `202611260002_fill_eur_usd_artwork_prices.sql` jednorazowo uzupełnia brakujące ceny EUR i USD na podstawie PLN, według kursów 4,5 PLN/EUR i 4,1 PLN/USD. Kwoty są zaokrąglane do pełnych jednostek, a wcześniej wpisane ceny nie są nadpisywane.

Migracja `202611260003_french_and_gbp.sql` dodaje GBP oraz ustawia domyślne waluty: PL — PLN, EN — GBP, DE — EUR i FR — USD. Nie tworzy cen GBP; należy je wpisać osobno.

Migracja `202611260004_gbp_and_round_prices.sql` uzupełnia brakujące ceny GBP po kursie 5,5 PLN/GBP na podstawie cen PLN sprzed zaokrąglenia, po czym jednorazowo zaokrągla ceny wszystkich walut w górę do pełnych dziesiątek. Wcześniej wpisane ceny GBP są zachowywane, ale również zaokrąglane. Migracja `202611260005_artwork_translations.sql` dodaje tłumaczenia istniejących tytułów i opisów bez nadpisywania już wpisanych tłumaczeń.

Migracja `202611260006_currency_formats.sql` zapisuje w walutach ustawienia formatowania ceny: locale, położenie symbolu i maksymalną liczbę miejsc po przecinku. Format USD to np. `5 370$`, GBP `£5,370`, a PLN nie wyświetla groszy. Ustawienia dotyczą prezentacji, nie zmieniają kwot w bazie.

Języki są definiowane w `src/i18n/languages.json`. Aby dodać język, dopisz jego kod, nazwę, locale zgodne z `Intl` oraz proponowaną walutę domyślną. Dodaj słownik o tym kodzie w `src/i18n/messages.json` i tekst biografii w `src/i18n/biography.json`. Brakujące teksty interfejsu korzystają z języka polskiego. Następnie w panelu „Języki i waluty” ustaw walutę domyślną nowego języka. Pola tłumaczeń pojawią się automatycznie po edycji zapisanego dzieła lub wystawy.

Tytuł i opis w głównym formularzu są tekstem źródłowym. Wersje językowe, w tym polską, zapisuje się w osobnym formularzu tłumaczeń pod edytorem. Brakujący tytuł lub opis używa tekstu źródłowego.

Waluty dodaje się w panelu, podając trzyliterowy kod ISO i nazwę. Ceny dzieła w każdej walucie podaje się osobno. Aplikacja nie przelicza cen; jeśli cena w wybranej walucie nie jest wpisana, nie jest wyświetlana ani uwzględniana w filtrze ceny. Zmiana języka wybiera jego domyślną walutę, a użytkownik może ją potem zmienić.
