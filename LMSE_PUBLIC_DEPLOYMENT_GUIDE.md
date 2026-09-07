# Guide de Déploiement Cloud LMSE Backend HTTPS

## 1. Déploiement via Docker / Docker Compose

### Étape 1 : Préparation de l'hôte Linux
```bash
git clone <URL_REPOSITORY>
cd "28+"
```

### Étape 2 : Configuration des Variables d'Environnement Production
Créer ou mettre à jour le fichier `.env.production` sur le serveur hôte :
```ini
NODE_ENV=production
PORT=3001
LMSE_PRIVATE_SIGNING_KEY=VOTRE_CLE_PRIVEE_HAUTEMENT_SECURISEE_CHAINE_LONGUE
VITE_LMSE_API_URL=https://lmse.bird-academy.fr
CORS_ORIGIN=https://admin.bird-academy.fr
```

### Étape 3 : Lancement du Service
```bash
docker-compose up -d --build
```

---

## 2. Configuration du Reverse Proxy Nginx & Certificat TLS (Certbot)

Exemple de bloc Nginx `/etc/nginx/sites-available/lmse.bird-academy.fr` :
```nginx
server {
    server_name lmse.bird-academy.fr;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Commande Certbot SSL :
```bash
sudo certbot --nginx -d lmse.bird-academy.fr
```

---

## 3. Propagation du Domaine et Injection dans le Build User Bêta

Une fois l'URL HTTPS valide active (ex: `https://lmse.bird-academy.fr`) :
1. Renseigner `.env.beta` : `VITE_LMSE_API_URL=https://lmse.bird-academy.fr`
2. Lancer la compilation : `npm run build:user:beta`
3. Auditer le bundle : `npm run verify:user-bundle`
