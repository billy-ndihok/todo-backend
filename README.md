# API Todo List avec Express, TypeScript et SQLite

Une API REST complète pour gérer une liste de tâches (Todo List), développée avec Express.js et TypeScript, utilisant SQLite dans un conteneur Docker comme base de données.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/swagger-%2385EA2D.svg?style=for-the-badge&logo=swagger&logoColor=black)

## 🌟 Fonctionnalités

- **Gestion complète des tâches** : Création, lecture, mise à jour et suppression (CRUD)
- **Filtrage des tâches** : Par statut (toutes, complétées, actives)
- **Documentation API** : Interface Swagger/OpenAPI interactive
- **Base de données SQLite** : Persistance des données dans un conteneur Docker
- **Tests unitaires et d'intégration** : Couverture complète avec Jest
- **TypeScript** : Typage statique pour une meilleure maintenabilité

## 📋 Prérequis

- Node.js >= 20.12.0
- Docker et Docker Compose
- npm

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/todo-api.git
cd todo-api
```

2. Installez les dépendances :
```bash
npm install
```


L'API sera disponible à l'adresse `http://localhost:3000` et la documentation Swagger à `http://localhost:3000/api-docs`.

## 🐳 Architecture Docker

L'application utilise Docker pour isoler la base de données SQLite :

- **Container SQLite** : Base de données légère stockée dans un volume persistant
- **Volumes** : Persistance des données entre les redémarrages
- **Configuration optimisée** : Pour un développement rapide et une mise en production simplifiée

```
├── docker-compose.yml    # Configuration des services
└── data/                 # Volume monté pour la base de données SQLite
    └── todo.db           # Fichier de base de données SQLite (créé automatiquement au premier lancement de l'application)
```

## Démarrage de l'application
Créer le dossier data
```bash
mkdir data
```
Démarrez l'application en mode développement :
```bash
npm run dev
```



## 📚 Documentation API avec Swagger

L'API est entièrement documentée avec Swagger/OpenAPI, accessible à l'adresse `http://localhost:3000/api-docs` :

Caractéristiques de la documentation :
- **Interface interactive** : Testez les endpoints directement depuis le navigateur
- **Documentation complète** : Tous les endpoints, paramètres et modèles
- **Exemples de requêtes** : Pour faciliter l'intégration avec un frontend

## 🔄 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/todos` | Récupérer toutes les tâches (avec filtrage optionnel) |
| GET | `/api/todos/:id` | Récupérer une tâche spécifique |
| POST | `/api/todos` | Créer une nouvelle tâche |
| PUT | `/api/todos/:id` | Mettre à jour une tâche |
| PATCH | `/api/todos/:id/status` | Changer le statut d'une tâche |
| DELETE | `/api/todos/:id` | Supprimer une tâche |

## ⚙️ Structure du projet

```
├── src/
│   ├── app.ts                 // Configuration Express
│   ├── server.ts              // Point d'entrée
│   ├── config/
│   │   ├── database.ts        // Configuration de la base de données
│   │   └── swagger.ts         // Configuration Swagger
│   ├── controllers/
│   │   └── todoController.ts  // Contrôleur pour les routes
│   ├── models/
│   │   └── Todo.ts            // Modèle pour les todos
│   ├── routes/
│   │   └── todoRoutes.ts      // Définition des routes
│   ├── services/
│   │   └── todoService.ts     // Logique métier
│   └── types/
│       └── todo.ts            // Types et interfaces
├── tests/
│   ├── integration/
│   │   └── todo.test.ts       // Tests d'intégration
│   └── unit/
│       ├── todoService.test.ts // Tests unitaires du service
│       └── todoController.test.ts // Tests unitaires du contrôleur
├── docker-compose.yml         // Configuration Docker
├── .env                       // Variables d'environnement
└── package.json               // Dépendances
```

## 🧪 Tests

L'application dispose d'une suite complète de tests unitaires et d'intégration :

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests avec watch mode
npm run test:watch

# Générer un rapport de couverture
npm run test:coverage
```

## 🛠️ Technologies utilisées

- **Express.js** : Framework web minimaliste
- **TypeScript** : Typage statique
- **SQLite** : Base de données légère
- **TypeORM** : ORM pour la gestion de la base de données
- **Docker** : Conteneurisation de la base de données
- **Swagger/OpenAPI** : Documentation de l'API
- **Jest** : Framework de test
- **supertest** : Tests d'API HTTP
 

## 👨‍💻 Auteur

Billy Ndihokubwayo
