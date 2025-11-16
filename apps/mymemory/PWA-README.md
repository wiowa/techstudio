# MyMemory Progressive Web App (PWA)

MyMemory est maintenant configuré comme une Progressive Web App! 🎉

## Fonctionnalités PWA activées

✅ **Web App Manifest** - Configuration de l'application pour l'installation
✅ **Service Worker** - Fonctionnalité offline et mise en cache
✅ **Meta tags PWA** - Support iOS et Android
✅ **Configuration Rspack** - Build optimisé pour la PWA

## Fichiers ajoutés

- `src/manifest.json` - Manifest de l'application PWA
- `src/service-worker.ts` - Service Worker pour le cache et mode offline
- `src/serviceWorkerRegistration.ts` - Utilitaire pour enregistrer le Service Worker
- `src/assets/icons/` - Dossier pour les icônes PWA (à créer)

## Prochaines étapes

### 1. Générer les icônes PWA

Vous devez créer les icônes pour votre PWA. Voici deux options:

#### Option A: Utiliser un générateur automatique

1. Créez une icône source de 512x512 pixels
2. Placez-la dans `src/assets/icons/icon-512x512.png`
3. Installez et utilisez PWA Asset Generator:

```bash
npm install -g pwa-asset-generator
cd apps/mymemory/src/assets/icons
pwa-asset-generator source-icon.png . --icon-only --background "#ffffff"
```

#### Option B: Créer manuellement

Créez manuellement les icônes aux tailles suivantes et placez-les dans `src/assets/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### 2. Personnaliser le manifest

Modifiez `src/manifest.json` pour personnaliser:
- `name` et `short_name` - Noms de l'application
- `description` - Description de l'application
- `theme_color` - Couleur du thème (barre d'adresse sur mobile)
- `background_color` - Couleur de fond de l'écran de démarrage
- `start_url` - URL de démarrage de l'application

### 3. Tester la PWA localement

1. Buildez l'application en mode production:
```bash
npx nx build mymemory
```

2. Servez les fichiers de build avec un serveur HTTP:
```bash
npx serve apps/mymemory/dist
```

3. Ouvrez Chrome et allez sur l'URL locale
4. Ouvrez DevTools (F12) > Application > Service Workers
5. Vérifiez que le Service Worker est enregistré
6. Dans l'onglet Manifest, vérifiez la configuration PWA
7. Testez l'installation: Chrome affichera une icône "Installer" dans la barre d'adresse

### 4. Tester en mode offline

1. Dans DevTools > Application > Service Workers, cochez "Offline"
2. Rechargez la page - elle devrait se charger depuis le cache
3. Décochez "Offline" pour revenir en ligne

### 5. Déploiement

Pour que la PWA fonctionne en production:

1. **HTTPS requis** - Les Service Workers nécessitent HTTPS (sauf pour localhost)
2. Mettez à jour le Dockerfile si nécessaire pour servir les fichiers PWA
3. Vérifiez que `manifest.json` et les icônes sont accessibles
4. Testez sur mobile pour vérifier l'expérience d'installation

## Vérification PWA

Utilisez ces outils pour vérifier votre PWA:

1. **Chrome DevTools Lighthouse** - Audit PWA complet
2. **PWA Builder** - https://www.pwabuilder.com/
3. **Chrome DevTools > Application** - Vérifier Manifest et Service Worker

## Fonctionnalités du Service Worker actuel

- ✅ Cache les ressources statiques au premier chargement
- ✅ Sert les ressources depuis le cache (mode offline)
- ✅ Mise à jour automatique du cache
- ✅ Stratégie "Cache First, Network Fallback"

## Personnalisation avancée

### Stratégies de cache

Le Service Worker actuel utilise une stratégie simple. Vous pouvez l'améliorer:

- **Network First** - Pour les contenus dynamiques
- **Cache First** - Pour les ressources statiques (actuel)
- **Stale While Revalidate** - Pour un équilibre performance/fraîcheur

### Notifications Push

Pour ajouter les notifications push, vous devrez:
1. Configurer Firebase Cloud Messaging ou un service similaire
2. Ajouter la logique dans le Service Worker
3. Demander les permissions utilisateur

### Background Sync

Pour synchroniser les données en arrière-plan quand la connexion revient.

## Ressources

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
