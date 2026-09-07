# Guide de Contribution - CanariGestion v1.2.0

Ce guide explique comment ajouter des fonctionnalités, des composants, de nouvelles langues ou des écrans au projet **CanariGestion** tout en respectant l'architecture établie.

---

## 1. Ajouter un Composant Réutilisable

Pour ajouter un nouveau composant dans le projet, respectez les étapes suivantes :

1.  **Créer le fichier :** Placez le composant sous `src/components/` et nommez-le en `PascalCase` avec l'extension `.tsx` (ex: `src/components/MyComponent.tsx`).
2.  **Importer les Design Tokens :** N'utilisez pas de valeurs codées en dur pour les styles. Importez les constantes sémantiques depuis `src/theme/` :
    ```tsx
    import { SEMANTIC_COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../theme';
    ```
3.  **Appliquer les classes :**
    ```tsx
    export const MyComponent: React.FC = () => {
      return (
        <div className={`p-4 ${BORDER_RADIUS.lg} ${SEMANTIC_COLORS.primary.lightBg} border ${SEMANTIC_COLORS.primary.border}`}>
          <h4 className={TYPOGRAPHY.h4}>Titre du Composant</h4>
          <p className={TYPOGRAPHY.body}>Description...</p>
        </div>
      );
    };
    ```
4.  **Assurer la compatibilité RTL & Thème :**
    *   N'utilisez pas de marges fixes asymétriques à gauche ou à droite (ex: `pl-4` ou `mr-2`) si le composant doit être inversé en Arabe. Utilisez plutôt des espacements logiques comme `space-x-4` ou des écarts de grilles (`gap-2`).
    *   Prévoyez les classes de couleur sombre `dark:` pour tous les éléments textuels et conteneurs de fond.

---

## 2. Ajouter une Nouvelle Traduction (ou clé de traduction)

Toutes les chaînes visibles par l'utilisateur doivent provenir du système d'internationalisation.

### Étape 1 : Déclarer la clé dans l'interface
Ouvrez `src/utils/translations.ts` et ajoutez la clé de traduction et son type dans l'interface `TranslationDict` :
```typescript
export interface TranslationDict {
  // ...
  myNewFeatureTitle: string;
}
```

### Étape 2 : Ajouter la traduction dans tous les dictionnaires de langues
Ajoutez la clé correspondante avec sa valeur traduite dans les blocs `fr`, `en`, `ar`, `es`, et `it` de la constante `TRANSLATIONS` :
```typescript
export const TRANSLATIONS: Record<Language, TranslationDict> = {
  fr: {
    // ...
    myNewFeatureTitle: "Mon Nouveau Titre",
  },
  en: {
    // ...
    myNewFeatureTitle: "My New Title",
  },
  ar: {
    // ...
    myNewFeatureTitle: "عنواني الجديد",
  },
  es: {
    // ...
    myNewFeatureTitle: "Mi Nuevo Título",
  },
  it: {
    // ...
    myNewFeatureTitle: "Il Mio Nuovo Titolo",
  }
};
```

### Étape 3 : Utiliser la clé dans le composant
```tsx
import { useLanguage } from '../context/LanguageContext';

const { t } = useLanguage();
return <h2 className="text-sm font-bold">{t('myNewFeatureTitle')}</h2>;
```

---

## 3. Ajouter un Nouvel Écran / Onglet (Tab)

Pour introduire un nouvel écran fonctionnel dans le tableau de bord :

1.  **Créer le composant de l'écran :** Créez le fichier de vue (ex: `src/components/MyNewScreen.tsx`).
2.  **Déclarer l'onglet dans le routage :**
    Dans `src/App.tsx`, localisez la liste des onglets disponibles dans `navigationItems` et ajoutez votre nouvel écran :
    ```typescript
    const navigationItems = [
      // ... fiches existantes ...
      { id: 'my_feature', label: t('myFeatureLabel'), icon: Sparkles },
    ];
    ```
3.  **Intégrer le composant de vue :**
    Sous le commutateur `switch (currentTab)` dans `App.tsx`, associez l'identifiant de l'onglet au rendu de votre composant :
    ```tsx
    case 'my_feature':
      return <MyNewScreen data={myData} onAction={handleAction} />;
    ```

---

## 4. Règles d'or de Contribution à Respecter Absolument

1.  **Respect de l'Intégrité Métier :** Ne modifiez jamais la logique métier sous-jacente des modules d'élevage ou de génétique, sauf demande explicite.
2.  **Mode Hors-ligne :** Toute modification de l'état doit être enregistrée de manière transparente dans le `localStorage` en utilisant l'utilitaire `saveToStorage`.
3.  **Type Safety (TypeScript) :** Déclarez toujours des types explicites pour les props de vos composants React. L'utilisation du type `any` est strictement interdite.
4.  **Vérification de Compilation :** Lancez toujours `npm run lint` et compilez le projet localement pour vous assurer qu'aucune régression ou erreur de type n'a été introduite avant de soumettre vos changements.
