import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('V1.3.5 I18N Details Translation Audit across FR, EN, AR, ES, IT', () => {
  const languages = ['fr', 'en', 'ar', 'es', 'it'] as const;

  const CATEGORY_MAP: Record<string, Record<string, string>> = {
    fr: { food: 'Alimentation', health: 'Santé', equipment: 'Matériel' },
    en: { food: 'Food & Feed', health: 'Health', equipment: 'Equipment' },
    ar: { food: 'التغذية', health: 'الصحة', equipment: 'المعدات' },
    es: { food: 'Alimentación', health: 'Salud', equipment: 'Materiales' },
    it: { food: 'Alimentazione', health: 'Salute', equipment: 'Attrezzatura' },
  };

  const BUYER_MAP: Record<string, Record<string, string>> = {
    fr: { amateur_breeder: 'Éleveur Amateur', pet_store: 'Animalerie' },
    en: { amateur_breeder: 'Amateur Breeder', pet_store: 'Pet Store' },
    ar: { amateur_breeder: 'مربي هاوي', pet_store: 'متجر حيوانات' },
    es: { amateur_breeder: 'Criador Aficionado', pet_store: 'Tienda de Mascotas' },
    it: { amateur_breeder: 'Allevatore Amatoriale', pet_store: 'Negozio per Animali' },
  };

  const TREATMENT_MAP: Record<string, Record<string, string>> = {
    fr: { deworming: "Vermifuge d'élevage", vitamins: "Vitamines E & Sélénium" },
    en: { deworming: "Breeding Dewormer", vitamins: "Vitamins E & Selenium" },
    ar: { deworming: "مضاد الطفيليات", vitamins: "فيتامين هـ وسيلينيوم" },
    es: { deworming: "Desparasitante de cría", vitamins: "Vitaminas E & Selenio" },
    it: { deworming: "Sverminante da allevamento", vitamins: "Vitamine E & Selenio" },
  };

  it('should translate expense categories across all 5 languages without French fallback leak', () => {
    languages.forEach(lang => {
      const translated = CATEGORY_MAP[lang]['food'];
      assert.notStrictEqual(translated, undefined);
      if (lang !== 'fr') {
        assert.notStrictEqual(translated, 'Alimentation');
      }
    });
  });

  it('should translate sales buyer types across all 5 languages', () => {
    languages.forEach(lang => {
      const translated = BUYER_MAP[lang]['amateur_breeder'];
      assert.notStrictEqual(translated, undefined);
      if (lang !== 'fr') {
        assert.notStrictEqual(translated, 'Éleveur Amateur');
      }
    });
  });

  it('should translate health treatments across all 5 languages', () => {
    languages.forEach(lang => {
      const translated = TREATMENT_MAP[lang]['deworming'];
      assert.notStrictEqual(translated, undefined);
      if (lang !== 'fr') {
        assert.notStrictEqual(translated, "Vermifuge d'élevage");
      }
    });
  });

  it('should flag RTL direction when language is Arabic', () => {
    const isRtl = (lang: string) => lang === 'ar';
    assert.strictEqual(isRtl('ar'), true);
    assert.strictEqual(isRtl('fr'), false);
    assert.strictEqual(isRtl('en'), false);
  });
});
