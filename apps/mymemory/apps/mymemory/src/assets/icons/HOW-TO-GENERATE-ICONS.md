# Génération d'icônes PWA pour MyMemory

## Icônes requises (tailles en pixels):
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## Méthode recommandée: PWA Asset Generator

1. Créez une icône source de 512x512px (format PNG ou SVG)
2. Installez l'outil:
   ```bash
   npm install -g pwa-asset-generator
   ```

3. Générez les icônes:
   ```bash
   cd apps/mymemory/src/assets/icons
   pwa-asset-generator votre-icone-source.png . --icon-only --padding "10%" --background "#000000"
   ```

## Alternative: Service en ligne

1. Allez sur https://www.pwabuilder.com/imageGenerator
2. Uploadez votre icône source
3. Téléchargez le package d'icônes générées
4. Copiez les fichiers dans ce dossier

## Template SVG fourni

Un fichier `icon-template.svg` a été créé avec un design simple.
Modifiez-le selon vos besoins, puis convertissez-le en PNG.

### Conversion SVG → PNG (plusieurs options):

**Avec Inkscape (gratuit, open-source):**
```bash
inkscape icon-template.svg --export-filename=icon-512x512.png --export-width=512
```

**Avec ImageMagick:**
```bash
brew install imagemagick  # Sur macOS
convert icon-template.svg -resize 192x192 icon-192x192.png
```

**En ligne:**
- https://cloudconvert.com/svg-to-png
- https://convertio.co/svg-png/

## Note importante

Les icônes actuellement dans le manifest pointent vers:
- /icons/icon-[taille].png

Assurez-vous que les noms de fichiers correspondent exactement!
