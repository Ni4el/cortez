import Image from "next/image";

export const metadata = { title: "O artyście", robots: { index: false, follow: false } };

export default function AboutPage() {
  return (
    <article className="content-section about-page" aria-labelledby="about-title">
      <p className="eyebrow">O artyście</p>
      <h1 id="about-title">Zbigniew Cortez Zając</h1>

      <div className="about-image">
        <Image
          src="/media/zbigniew_cortez_zajac.webp"
          alt="Zbigniew Cortez Zając"
          width={2048}
          height={1366}
          priority
        />
      </div>

      <div className="about-copy">
        <p>W ostatnich latach można wyraźnie zaobserwować renesans malarstwa nawiązującego do realizmu czy też postimpresjonizmu. Coraz więcej tak artystów jak i odbiorców skłania się ku sztuce komunikatywnej, opartej na solidnym rysunku i nienagannej technice malarskiej. Przykładem takiego właśnie podejścia do idei tworzenia jest postać artysty malarza Zbigniewa "Corteza" Zająca.</p>
        <p>Choć formalnie nie posiada wykształcenia akademickiego w dziedzinie sztuk wizualnych nie "papier" jest ważny, ale rzeczywiste umiejętności. Jak sam wspomina sztuką interesował się od dziecka, malował, rysował, niestety koleje losu sprawiły, że jako młody człowiek nie mógł kontynuować edukacji w tym kierunku. Jednak wrodzony talent nie dał o sobie zapomnieć i po latach powrócił do ulubionego zajęcia. Biegłość w rzemiośle zdobywał w oparciu o analizę twórczości klasyków wykonując kopie obrazów, poznawał tajniki kompozycji, a w szczególności zawiłości techniki jaką jest malarstwo olejne. Warty podkreślenia jest fakt, że obecnie większość malarzy znacznie chętniej posługuje się techniką akrylową, która jest o wiele mniej wymagająca, farby schną szybko, pozwalając często podczas jednego posiedzenia ukończyć pracę, jednakże w przypadku kopii ta prosta technika nie jest w stanie w sposób zadowalający oddać w pełni charakter pierwotnego dzieła, pozostając na etapie powierzchniowego odwzorowania.</p>
        <p>Przyglądając się pracom Zbigniewa zwraca uwagę wykorzystanie przez Niego całego wachlarza możliwości jakie daje właśnie olej, o ile operowanie barwnymi plamami w przypadku realizacji prac w duchu postimpresjonizmu czy Młodej Polski wydaje się dość proste o tyle tworzenie kopii mistrzów Baroku czy Renesansu wymaga olbrzymiego doświadczenia i wiedzy szczególnie w dziedzinie uzyskiwania efektów laserunkowych, które zmuszają do zachowania reżimu technologicznego, poza tym są żmudne i czasochłonne. Już samo "wzięcie na warsztat" dzieł Rembrandta czy Vermeera, próba rozszyfrowania tajników płótna wydaje się aktem niezwykłej odwagi, której widać Artyście nie brakuje.</p>
        <p>Twórczość Zbigniewa Zająca jest, co warte podkreślenia, wyjątkowo różnorodna, bardzo często malarze mają swoje ulubione motywy, które stają się z czasem ich znakiem rozpoznawczym, są specjaliści od portretów, pejzaży, martwych natur, scen zbiorowych itp. Są tacy, którzy nigdy nie eksperymentują trzymając się konsekwentnie raz obranej drogi. Zbigniew jest bardzo niespokojną duszą, za wszelką cenę stara się uniknąć zaszufladkowania, obok klasycznej martwej natury pojawiają się pełne dynamiki sceny zbiorowe, historyczne kadry z dumnymi jeźdźcami pełne romantycznego nastroju. Artysta jasno określa swoje fascynacje, wymienia trzech najważniejszych dla siebie mistrzów, są to Józef Brandt, Jan Matejko, Rembrandt van Rijn - trudno o lepsze wzorce. W każdym razie duch twórczości tych właśnie artystów jest doskonale wyczuwalny w twórczości "Corteza". Celowo użyłem "twórczości", bo jestem przekonany, że różnego rodzaju obrazy, kopie, które powstają na podstawie klasycznych dzieł to aktywność mająca przede wszystkim cel poznawczy, edukacyjny, szlifowanie techniki i umiejętności pozwalających na realizację własnych autorskich wizji.</p>
        <p>Obok portretów i pejzaży do szczególnie udanych autorskich kompozycji należy zaliczyć sceny inspirowane malarstwem historycznym i rodzajowym. Artysta dzielnie idzie w szranki z takimi specjalistami, jak już wspomniany Brandt, Chełmoński czy Kossak, szczególnie jeśli chodzi o temat koni, które maluje pewnymi pociągnięciami pędzla oddając czar i piękno tego tak bardzo polskiego motywu. Rodzaj malarstwa jaki uprawia Zbigniew Zając daleki jest od formalnych eksperymentów, próżno by tutaj szukać jakichkolwiek awangardowych rozwiązań czy kontrowersyjnych tematów. To twórczość skierowana do odbiorcy, który szuka klasycznie pojętego piękna, który ceni sobie ponadczasowe, nieprzemijające wartości odporne na efemeryczne mody. Malarstwo dla Zbigniewa to nie jest tylko realizacja kolejnych obrazów, to sposób na życie, prawdziwa pasja, której się bez reszty poświęcił.</p>
        <p>Jego twórczość, wydaje mi się, będzie ciągle ewoluować, bo każdy Artysta codziennie uczy się czegoś nowego i śni o pustych blejtramach spragnionych koloru...</p>

        <footer className="about-author">
          <p><strong>Piotr Qkla Kukla</strong> – Kurator<br />Kierownik Działu Organizacji Wystaw BWA w Tarnowie<br />2020</p>
        </footer>
      </div>
    </article>
  );
}
