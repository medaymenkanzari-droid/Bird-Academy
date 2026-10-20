import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GeneticsEngine } from '../src/features/genetics/engines/GeneticsEngine';
import type { Canari } from '../src/types';

describe('BIO-REF-V2 GAP-09: Isolation inter-espèces du moteur génétique et refus des hybridations non homologuées', () => {

  // =========================================================================
  // SECTION 9 DU PROMPT : TESTS OBLIGATOIRES 1 À 8
  // =========================================================================

  it('Test 1: Roseicollis × Roseicollis -> chemin intra-spécifique autorisé', () => {
    const male = {
      id: 1,
      nom: 'Roseicollis Male Opaline',
      sexe: 'Mâle',
      espece: 'agapornis_roseicollis',
      mutation: 'ar_opaline'
    } as unknown as Canari;

    const female = {
      id: 2,
      nom: 'Roseicollis Female Opaline',
      sexe: 'Femelle',
      espece: 'agapornis_roseicollis',
      mutation: 'ar_opaline'
    } as unknown as Canari;

    const result = GeneticsEngine.predictOffspringOutcomes(male, female);
    assert.strictEqual(result.status, 'SUCCESS');
    assert.ok(result.phenotypes.length > 0);
    assert.strictEqual(result.phenotypes[0].probability, 100);
    assert.ok(result.phenotypes[0].name.includes('ar_opaline'));
  });

  it('Test 2: Fischeri × Fischeri -> ne doit pas être transformé en Roseicollis (OUT_OF_SCOPE)', () => {
    const male = {
      id: 3,
      nom: 'Fischeri Male',
      sexe: 'Mâle',
      espece: 'agapornis_fischeri',
      mutation: 'Lutino'
    } as unknown as Canari;

    const female = {
      id: 4,
      nom: 'Fischeri Female',
      sexe: 'Femelle',
      espece: 'agapornis_fischeri',
      mutation: 'Lutino'
    } as unknown as Canari;

    const result = GeneticsEngine.predictOffspringOutcomes(male, female);
    assert.strictEqual(result.status, 'OUT_OF_SCOPE');
    assert.strictEqual(result.phenotypes.length, 0);
  });

  it('Test 3: Personatus × Personatus -> ne doit pas être transformé en Roseicollis (OUT_OF_SCOPE si hors catalogue minimal)', () => {
    const male = {
      id: 5,
      nom: 'Personatus Male Inconnu',
      sexe: 'Mâle',
      espece: 'agapornis_personatus',
      mutation: 'Lutino' // Lutino n'existe pas dans le catalogue minimal Personatus scellé
    } as unknown as Canari;

    const female = {
      id: 6,
      nom: 'Personatus Female Inconnu',
      sexe: 'Femelle',
      espece: 'agapornis_personatus',
      mutation: 'Lutino'
    } as unknown as Canari;

    const result = GeneticsEngine.predictOffspringOutcomes(male, female);
    assert.strictEqual(result.status, 'OUT_OF_SCOPE');
    assert.strictEqual(result.phenotypes.length, 0);
  });

  it('Test 4: Roseicollis × Fischeri -> HYBRID_CROSS_UNSUPPORTED', () => {
    const male = {
      id: 7,
      nom: 'Roseicollis Male',
      sexe: 'Mâle',
      espece: 'agapornis_roseicollis',
      mutation: 'ar_opaline'
    } as unknown as Canari;

    const female = {
      id: 8,
      nom: 'Fischeri Female',
      sexe: 'Femelle',
      espece: 'agapornis_fischeri',
      mutation: 'ar_opaline' // Même string volontaire pour tester le non-détournement
    } as unknown as Canari;

    const result = GeneticsEngine.predictOffspringOutcomes(male, female);
    assert.strictEqual(result.status, 'HYBRID_CROSS_UNSUPPORTED');
    assert.strictEqual(result.phenotypes.length, 0);
    assert.ok(result.reason?.includes('Croisement inter-espèces non pris en charge'));
  });

  it('Test 5: Roseicollis × Personatus -> HYBRID_CROSS_UNSUPPORTED', () => {
    const male = {
      id: 9,
      nom: 'Roseicollis Male',
      sexe: 'Mâle',
      espece: 'agapornis_roseicollis',
      mutation: 'ar_lutino'
    } as unknown as Canari;

    const female = {
      id: 10,
      nom: 'Personatus Female',
      sexe: 'Femelle',
      espece: 'agapornis_personatus',
      mutation: 'ap_blue'
    } as unknown as Canari;

    const result = GeneticsEngine.predictOffspringOutcomes(male, female);
    assert.strictEqual(result.status, 'HYBRID_CROSS_UNSUPPORTED');
    assert.strictEqual(result.phenotypes.length, 0);
  });

  it('Test 6: Fischeri × Personatus -> HYBRID_CROSS_UNSUPPORTED', () => {
    const male = {
      id: 11,
      nom: 'Fischeri Male',
      sexe: 'Mâle',
      espece: 'agapornis_fischeri',
      mutation: 'Vert'
    } as unknown as Canari;

    const female = {
      id: 12,
      nom: 'Personatus Female',
      sexe: 'Femelle',
      espece: 'agapornis_personatus',
      mutation: 'Vert'
    } as unknown as Canari;

    const result = GeneticsEngine.predictOffspringOutcomes(male, female);
    assert.strictEqual(result.status, 'HYBRID_CROSS_UNSUPPORTED');
    assert.strictEqual(result.phenotypes.length, 0);
  });

  it('Test 7: Canari × Roseicollis -> HYBRID_CROSS_UNSUPPORTED', () => {
    const male = {
      id: 13,
      nom: 'Canari Male',
      sexe: 'Mâle',
      espece: 'canari',
      mutation: 'Agathe Pastel'
    } as unknown as Canari;

    const female = {
      id: 14,
      nom: 'Roseicollis Female',
      sexe: 'Femelle',
      espece: 'agapornis_roseicollis',
      mutation: 'ar_opaline'
    } as unknown as Canari;

    const result = GeneticsEngine.predictOffspringOutcomes(male, female);
    assert.strictEqual(result.status, 'HYBRID_CROSS_UNSUPPORTED');
    assert.strictEqual(result.phenotypes.length, 0);
  });

  it('Test 8: Même mutation textuelle présente dans deux espèces différentes -> JAMAIS interprétée comme commune', () => {
    const male = {
      id: 15,
      nom: 'Roseicollis Lutino',
      sexe: 'Mâle',
      espece: 'agapornis_roseicollis',
      mutation: 'Lutino'
    } as unknown as Canari;

    const female = {
      id: 16,
      nom: 'Fischeri Lutino',
      sexe: 'Femelle',
      espece: 'agapornis_fischeri',
      mutation: 'Lutino'
    } as unknown as Canari;

    // Même chaîne historique "Lutino" pour les deux parents d'espèces différentes
    const result = GeneticsEngine.predictOffspringOutcomes(male, female);
    assert.strictEqual(result.status, 'HYBRID_CROSS_UNSUPPORTED');
    assert.strictEqual(result.phenotypes.length, 0);

    // Vérifier également via simulatePairInheritance
    const inheritanceResult = GeneticsEngine.simulatePairInheritance(male, female);
    assert.strictEqual(inheritanceResult.status, 'HYBRID_CROSS_UNSUPPORTED');
    assert.strictEqual(inheritanceResult.phenotypes.length, 0);
  });

  // =========================================================================
  // SECTION 10 DU PROMPT : TESTS DE NON-RÉGRESSION COMPLETS
  // =========================================================================

  describe('A. Intra-espèce (conservation du calcul standard)', () => {
    it('Canari × Canari : calcul normal conservé', () => {
      const male = {
        id: 17,
        nom: 'Male Canari',
        sexe: 'Mâle',
        espece: 'canari',
        mutation: 'Agathe Pastel'
      } as unknown as Canari;

      const female = {
        id: 18,
        nom: 'Femelle Canari',
        sexe: 'Femelle',
        espece: 'canari',
        mutation: 'Agathe Pastel'
      } as unknown as Canari;

      const result = GeneticsEngine.predictOffspringOutcomes(male, female);
      assert.strictEqual(result.status, 'SUCCESS');
      assert.ok(result.phenotypes.length > 0);
      assert.strictEqual(result.phenotypes[0].probability, 100);
      assert.ok(result.phenotypes[0].name.includes('Agathe Pastel'));
    });
  });

  describe('B. Paires inter-espèces variées reconnues du référentiel', () => {
    const pairs = [
      ['canari', 'chardonneret_elegant'],
      ['chardonneret_elegant', 'canari'],
      ['canari', 'agapornis_roseicollis'],
      ['diamant_mandarin', 'diamant_gould'],
      ['perruche_ondulee', 'calopsitte'],
      ['colombe_diamant', 'canari']
    ];

    for (const [spMale, spFemale] of pairs) {
      it(`Refuse le croisement hybride ${spMale} × ${spFemale}`, () => {
        const male = { id: 100, nom: 'M', sexe: 'Mâle', espece: spMale, mutation: 'Classique' } as unknown as Canari;
        const female = { id: 101, nom: 'F', sexe: 'Femelle', espece: spFemale, mutation: 'Classique' } as unknown as Canari;

        const result = GeneticsEngine.predictOffspringOutcomes(male, female);
        assert.strictEqual(result.status, 'HYBRID_CROSS_UNSUPPORTED');
        assert.strictEqual(result.phenotypes.length, 0);
      });
    }
  });

  describe('C. Espèces inconnues, indéterminées ou legacy ambiguës', () => {
    it('Refuse si espèce undefined pour l’un des parents', () => {
      const male = { id: 201, nom: 'M', sexe: 'Mâle', mutation: 'Opale' } as unknown as Canari; // espece undefined
      const female = { id: 202, nom: 'F', sexe: 'Femelle', espece: 'canari', mutation: 'Opale' } as unknown as Canari;

      const result = GeneticsEngine.predictOffspringOutcomes(male, female);
      assert.strictEqual(result.status, 'INSUFFICIENT_INFORMATION');
      assert.strictEqual(result.phenotypes.length, 0);
    });

    it('Refuse si espèce null ou vide', () => {
      const male = { id: 203, nom: 'M', sexe: 'Mâle', espece: '', mutation: 'Opale' } as unknown as Canari;
      const female = { id: 204, nom: 'F', sexe: 'Femelle', espece: null as unknown as string, mutation: 'Opale' } as unknown as Canari;

      const result = GeneticsEngine.predictOffspringOutcomes(male, female);
      assert.strictEqual(result.status, 'INSUFFICIENT_INFORMATION');
      assert.strictEqual(result.phenotypes.length, 0);
    });

    it('Refuse si espèce inconnue du registre canonique', () => {
      const male = { id: 205, nom: 'M', sexe: 'Mâle', espece: 'espece_inconnue_xyz', mutation: 'Opale' } as unknown as Canari;
      const female = { id: 206, nom: 'F', sexe: 'Femelle', espece: 'espece_inconnue_xyz', mutation: 'Opale' } as unknown as Canari;

      const result = GeneticsEngine.predictOffspringOutcomes(male, female);
      assert.strictEqual(result.status, 'INSUFFICIENT_INFORMATION');
      assert.strictEqual(result.phenotypes.length, 0);
    });

    it('Refuse une espèce non répertoriée comme tarin_des_aulnes ou moineau_du_japon', () => {
      const male = { id: 207, nom: 'M', sexe: 'Mâle', espece: 'tarin_des_aulnes', mutation: 'Classique' } as unknown as Canari;
      const female = { id: 208, nom: 'F', sexe: 'Femelle', espece: 'canari', mutation: 'Classique' } as unknown as Canari;

      const result = GeneticsEngine.predictOffspringOutcomes(male, female);
      assert.strictEqual(result.status, 'INSUFFICIENT_INFORMATION');
      assert.strictEqual(result.phenotypes.length, 0);
    });

    it('Refuse le legacy ambigu "agapornis" non résolu', () => {
      const male = { id: 209, nom: 'M', sexe: 'Mâle', espece: 'agapornis', mutation: 'Lutino' } as unknown as Canari;
      const female = { id: 210, nom: 'F', sexe: 'Femelle', espece: 'agapornis', mutation: 'Lutino' } as unknown as Canari;

      const result = GeneticsEngine.predictOffspringOutcomes(male, female);
      assert.strictEqual(result.status, 'INSUFFICIENT_INFORMATION');
      assert.strictEqual(result.phenotypes.length, 0);
    });
  });

  describe('D. Protection contre substring match (Section 11)', () => {
    it('Deux espèces partageant le préfixe "agapornis_" ne doivent PAS être traitées comme identiques', () => {
      const male = { id: 301, nom: 'M', sexe: 'Mâle', espece: 'agapornis_roseicollis', mutation: 'ar_opaline' } as unknown as Canari;
      const female = { id: 302, nom: 'F', sexe: 'Femelle', espece: 'agapornis_fischeri', mutation: 'ar_opaline' } as unknown as Canari;

      assert.ok(male.espece?.startsWith('agapornis'));
      assert.ok(female.espece?.startsWith('agapornis'));

      const result = GeneticsEngine.predictOffspringOutcomes(male, female);
      assert.strictEqual(result.status, 'HYBRID_CROSS_UNSUPPORTED');
      assert.strictEqual(result.phenotypes.length, 0);
    });
  });

  describe('E. Intégration simulatePairing (analyse des risques)', () => {
    it('Émet le risque hybridCrossUnsupported et differentSpecies en cas d’espèces différentes', () => {
      const male = { id: 401, nom: 'M', sexe: 'Mâle', espece: 'agapornis_roseicollis', mutation: 'ar_opaline' } as unknown as Canari;
      const female = { id: 402, nom: 'F', sexe: 'Femelle', espece: 'canari', mutation: 'ar_opaline' } as unknown as Canari;

      const analysis = GeneticsEngine.simulatePairing(male.id, female.id, [male, female]);
      const riskCodes = analysis.risks.map(r => r.code);
      assert.ok(riskCodes.includes('genetics.message.differentSpecies'));
      assert.ok(riskCodes.includes('genetics.message.hybridCrossUnsupported'));
      assert.strictEqual(analysis.summary.code, 'genetics.message.hybridCrossUnsupported');
    });

    it('N’émet PAS hybridCrossUnsupported pour une paire intra-spécifique de même espèce', () => {
      const male = { id: 403, nom: 'M', sexe: 'Mâle', espece: 'canari', mutation: 'Agathe Pastel' } as unknown as Canari;
      const female = { id: 404, nom: 'F', sexe: 'Femelle', espece: 'canari', mutation: 'Agathe Pastel' } as unknown as Canari;

      const analysis = GeneticsEngine.simulatePairing(male.id, female.id, [male, female]);
      const riskCodes = analysis.risks.map(r => r.code);
      assert.ok(!riskCodes.includes('genetics.message.differentSpecies'));
      assert.ok(!riskCodes.includes('genetics.message.hybridCrossUnsupported'));
      assert.notStrictEqual(analysis.summary.code, 'genetics.message.hybridCrossUnsupported');
    });
  });
});
