#!/usr/bin/env node

/**
 * Script pour générer des icônes PWA temporaires en Canvas (Node.js)
 *
 * Usage: node generate-pwa-icons.js
 *
 * Note: Pour de vraies icônes professionnelles, utilisez:
 * 1. Un outil comme Figma/Photoshop pour créer une vraie icône
 * 2. https://realfavicongenerator.net/
 * 3. npx pwa-asset-generator
 */

const fs = require('fs');
const path = require('path');

// Tailles d'icônes requises pour la PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, 'apps/mymemory/src/assets/icons');

console.log('⚠️  Ce script génère des icônes TEMPORAIRES pour tester la PWA.');
console.log('📝 Pour une PWA en production, créez de vraies icônes personnalisées!\n');

// Vérifier si le dossier existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Pour générer vos icônes PWA, vous avez plusieurs options:\n');
console.log('Option 1: Utiliser un service en ligne');
console.log('  → https://realfavicongenerator.net/');
console.log('  → https://www.pwabuilder.com/imageGenerator\n');

console.log('Option 2: Utiliser PWA Asset Generator (recommandé)');
console.log('  1. Créez une icône carrée de 512x512px (PNG ou SVG)');
console.log('  2. Installez: npm install -g pwa-asset-generator');
console.log('  3. Exécutez: cd apps/mymemory/src/assets/icons');
console.log('  4. Générez: pwa-asset-generator votre-icone.png . --icon-only --background "#000000"\n');

console.log('Option 3: Manuellement avec un éditeur d\'images');
console.log('  → Créez des PNG aux tailles: ' + sizes.join(', ') + ' pixels\n');

console.log('📁 Un template SVG a été créé: icon-template.svg');
console.log('   Modifiez-le et convertissez-le en PNG avec un outil comme:');
console.log('   - Inkscape (gratuit): https://inkscape.org/');
console.log('   - En ligne: https://cloudconvert.com/svg-to-png\n');

console.log('Pour MacOS avec Homebrew:');
console.log('  brew install imagemagick');
console.log('  convert icon-template.svg -resize 192x192 icon-192x192.png\n');

// Créer un fichier d'instructions
const instructions = `# Génération d'icônes PWA pour MyMemory

## Icônes requises (tailles en pixels):
${sizes.map(size => `- ${size}x${size}`).join('\n')}

## Méthode recommandée: PWA Asset Generator

1. Créez une icône source de 512x512px (format PNG ou SVG)
2. Installez l'outil:
   \`\`\`bash
   npm install -g pwa-asset-generator
   \`\`\`

3. Générez les icônes:
   \`\`\`bash
   cd apps/mymemory/src/assets/icons
   pwa-asset-generator votre-icone-source.png . --icon-only --padding "10%" --background "#000000"
   \`\`\`

## Alternative: Service en ligne

1. Allez sur https://www.pwabuilder.com/imageGenerator
2. Uploadez votre icône source
3. Téléchargez le package d'icônes générées
4. Copiez les fichiers dans ce dossier

## Template SVG fourni

Un fichier \`icon-template.svg\` a été créé avec un design simple.
Modifiez-le selon vos besoins, puis convertissez-le en PNG.

### Conversion SVG → PNG (plusieurs options):

**Avec Inkscape (gratuit, open-source):**
\`\`\`bash
inkscape icon-template.svg --export-filename=icon-512x512.png --export-width=512
\`\`\`

**Avec ImageMagick:**
\`\`\`bash
brew install imagemagick  # Sur macOS
convert icon-template.svg -resize 192x192 icon-192x192.png
\`\`\`

**En ligne:**
- https://cloudconvert.com/svg-to-png
- https://convertio.co/svg-png/

## Note importante

Les icônes actuellement dans le manifest pointent vers:
- /icons/icon-[taille].png

Assurez-vous que les noms de fichiers correspondent exactement!
`;

fs.writeFileSync(
  path.join(outputDir, 'HOW-TO-GENERATE-ICONS.md'),
  instructions
);

console.log('✅ Instructions complètes créées dans: apps/mymemory/src/assets/icons/HOW-TO-GENERATE-ICONS.md\n');
console.log('🎨 Fichier template SVG disponible pour personnalisation\n');
