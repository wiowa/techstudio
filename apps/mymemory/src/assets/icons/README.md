# PWA Icons

Pour générer les icônes PWA, vous devez créer une icône source de 512x512 pixels et la placer dans ce dossier avec le nom `icon-512x512.png`.

Ensuite, vous pouvez utiliser un outil comme [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) pour générer automatiquement toutes les tailles nécessaires:

```bash
npx pwa-asset-generator icon-512x512.png ./icons --icon-only --background "#ffffff"
```

Les tailles requises sont:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

Pour l'instant, vous pouvez utiliser le favicon existant comme icône temporaire.
