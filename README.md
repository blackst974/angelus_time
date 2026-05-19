[README.md](https://github.com/user-attachments/files/28003385/README.md)
# ✨ Angélus Time

> *Tout ce que vous demanderez avec foi par la prière, vous le recevrez.* — Mt 21:22

Application mobile catholique de prière, installable sur l'écran d'accueil (PWA).

---

## 🙏 Fonctionnalités

| Section | Contenu |
|---|---|
| ☀️ **Prière du Matin** | Litanie du Précieux Sang |
| 🙏 **Angélus** | Version traditionnelle & version chantée |
| 🌙 **Prière du Soir** | Prière personnelle, protection mariale, saint Michel |

- 🎵 **Audio synchronisé** — le texte défile au rythme de l'audio
- 🔔 **Rappels personnalisables** — heure configurable pour chaque prière
- 📱 **Installable sur mobile** — fonctionne comme une app native (PWA)
- 🌐 **Hors-ligne** — les prières et audios sont mis en cache
- 🖼️ **Image de fond** — placer `Mary.jpg` à la racine pour l'activer

---

## 🚀 Hébergement sur GitHub Pages

### 1. Créer le dépôt

```bash
# Créer un nouveau dépôt sur GitHub (ex: angelus-time), puis :
git clone https://github.com/VOTRE_USERNAME/angelus-time.git
cd angelus-time
```

### 2. Copier les fichiers

Copiez tous les fichiers du projet dans le dossier cloné :

```
angelus-time/
├── index.html
├── manifest.json
├── service-worker.js
├── icons/
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
├── Mary.jpg               ← image de fond (à ajouter)
├── morning-prayer.mp3     ← audio prière du matin
├── angelus-traditional.mp3
├── angelus-chant.mp3
└── evening-prayer.mp3
```

### 3. Pousser sur GitHub

```bash
git add .
git commit -m "🙏 Initial commit — Angélus Time"
git push origin main
```

### 4. Activer GitHub Pages

1. Aller dans **Settings** → **Pages**
2. Source : **Deploy from a branch**
3. Branch : `main` / `/ (root)`
4. Cliquer **Save**

Votre app sera disponible sur :
`https://VOTRE_USERNAME.github.io/angelus-time/`

---

## 📁 Fichiers audio requis

Placez vos fichiers MP3 à la racine du projet :

| Fichier | Description |
|---|---|
| `morning-prayer.mp3` | Prière du matin (Litanie du Précieux Sang) |
| `angelus-traditional.mp3` | L'Angélus traditionnel |
| `angelus-chant.mp3` | L'Angélus version chantée |
| `evening-prayer.mp3` | Prière du soir |

> **Conseil :** Vous pouvez trouver des audios libres de droits sur [archive.org](https://archive.org) en cherchant "angelus catholique" ou "prière catholique".

---

## 📱 Installation sur mobile

**iPhone (Safari) :**
1. Ouvrir l'URL dans Safari
2. Appuyer sur le bouton Partager ↑
3. Choisir **"Sur l'écran d'accueil"**

**Android (Chrome) :**
1. Ouvrir l'URL dans Chrome
2. La bannière d'installation apparaît automatiquement
3. Ou : menu ⋮ → **"Ajouter à l'écran d'accueil"**

---

## 🛠️ Technologies

- HTML5 / CSS3 / JavaScript vanilla
- PWA (Service Worker + Web App Manifest)
- Google Fonts : Cinzel & Poppins
- Hébergement : GitHub Pages (gratuit)

---

*Fait avec ✝️ et ❤️*
