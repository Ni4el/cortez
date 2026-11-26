import Image from "next/image";
import { LandingBackButton } from "@/components/landing-back-button";
import { getLocalizedMetadata, getRequestPreferences } from "@/lib/i18n.server";
import biographies from "@/i18n/biography.json";

export const generateMetadata = () => getLocalizedMetadata("aboutArtist");

export default async function AboutPage() {
  const { messages: m, language } = await getRequestPreferences();
  const paragraphs = (biographies as Record<string, string[]>)[language.code] ?? biographies.pl;
  return (
    <article className="content-section about-page" aria-labelledby="about-title">
      <div className="about-header">
        <LandingBackButton defaultHash="#o-autorze" />
        <p className="eyebrow">{m.aboutArtist}</p>
      </div>
      <div className="about-hero">
        <div className="about-hero-image">
          <Image src="/media/zbigniew_cortez_zajac.webp" alt="Zbigniew Cortez Zając" width={1200} height={800} priority />
        </div>
        <div className="about-hero-content">
          <h1 id="about-title">Zbigniew<br />Cortez<br />Zając</h1>
        </div>
      </div>
      <div className="about-copy">
        {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <footer className="about-author">
          <p><strong>Piotr Qkla Kukla</strong> – {m.curator}<br />{m.curatorRole}<br />2020</p>
        </footer>
      </div>
    </article>
  );
}
