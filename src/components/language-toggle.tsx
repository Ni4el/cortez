"use client";

export function LanguageToggle() {
  return (
    <div className="language-picker" aria-label="Wybór języka">
      <button type="button" className="language-current" aria-current="true" aria-haspopup="true">PL</button>
      <div className="language-options">
        <button type="button" aria-label="English — wkrótce" title="English — wkrótce">EN</button>
        <button type="button" aria-label="Deutsch — wkrótce" title="Deutsch — wkrótce">DE</button>
      </div>
    </div>
  );
}
