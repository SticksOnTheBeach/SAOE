# SAOE - Système d'Affectation Optimisée des Étudiant(e)s

Application web permettant de modéliser des salles d'examen, de gérer des promotions d'étudiants et de générer automatiquement des plans de placement optimisés lors d'évaluations.

Projet réalisé dans le cadre de la deuxième année de BUT Informatique à l'IUT du Limousin.

---

## Fonctionnalités

- **Modélisation de salles** : Création et configuration de salles sous forme de grille (lignes et colonnes) avec différents types de places (place disponible, place équipée d'une prise électrique, place interdite, couloir ou case vide).
- **Placement automatisé sous contraintes** : Affectation optimale des étudiants aux places disponibles grâce au moteur de résolution Timefold Solver selon les règles suivantes :
  - Un seul étudiant par place.
  - Aucun étudiant sur une place marquée comme interdite.
  - Attribution obligatoire d'une place avec prise électrique aux étudiants qui en ont besoin.
  - Interdiction de placer deux étudiants d'un même groupe côte à côte ou l'un derrière l'autre (voisins directs).
- **Persistance des données** : Sauvegarde et consultation des salles et des étudiants via une API REST reliée à une base de données.

---

## Architecture et Technologies

Le projet est découpé en deux parties indépendantes qui communiquent via une API REST en JSON :

### Backend (`/backend`)
- **Langage** : Java 21
- **Framework** : Spring Boot 3.5 (Spring Web, Spring Data JPA / Hibernate)
- **Moteur d'optimisation** : Timefold Solver 1.34
- **Base de données** : H2 Database (en mémoire pour le développement et les tests) / PostgreSQL
- **Tests** : JUnit 5, AssertJ, Spring MockMvc, Timefold ConstraintVerifier
- **Gestionnaire de build** : Maven

### Frontend (`/frontend`)
- **Framework / Bibliothèque** : React 19 avec TypeScript
- **Routage** : React Router v8
- **Style** : Tailwind CSS v4
- **Outil de build et serveur de développement** : Vite (avec proxy `/api` redirigé vers `http://localhost:8080`)
- **Linter** : Oxlint

---

## Prérequis

- **Java JDK 21**
- **Maven** (3.9+)
- **Node.js** (20+) et **npm**

---

## Installation et Lancement

Pour faire fonctionner l'application complète en local, lancez le backend et le frontend dans deux terminaux séparés.

### 1. Lancer le Backend (port 8080)

```bash
cd backend
mvn spring-boot:run
```

Pour exécuter les tests unitaires du backend :

```bash
cd backend
mvn test
```

### 2. Lancer le Frontend (port 5174)

```bash
cd frontend
npm install
npm run dev
```

L'interface web est ensuite accessible à l'adresse suivante : `http://localhost:5174`

---

## Structure du projet

```text
SAOE/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/fr/iutinfo/seatingplan/
│       │   ├── placement/       # Modèle Timefold (SeatingPlan, SeatAssignment, contraintes)
│       │   ├── room/            # Entités Room et Seat, RoomRepository, RoomController
│       │   ├── student/         # Entité Student, Group, StudentRepository, StudentController
│       │   └── testdata/        # Données et contrôleur de test pour le prototypage
│       └── test/java/           # Tests unitaires et tests de contraintes Timefold
└── frontend/
    ├── package.json
    ├── vite.config.ts           # Configuration Vite et proxy vers le backend (port 8080)
    └── src/
        ├── components/          # Composants communs (Header, Footer, Layout)
        └── pages/               # Pages de l'application (HomePage, RoomPage, ClassDispositionPage, etc.)
```

---

## Endpoints principaux de l'API

- `GET /api/rooms` : Récupère la liste de toutes les salles enregistrées.
- `GET /api/rooms/{id}` : Récupère le détail d'une salle spécifique et de ses places.
- `POST /api/rooms` : Crée et enregistre une nouvelle salle.
- `GET /students` : Récupère la liste des étudiants.
- `POST /students` : Ajoute un nouvel étudiant.
- `DELETE /students/{id}` : Supprime un étudiant.

---

## Développeurs sur ce projet

- Maël Retault
- Trystan Deneuve
- Emile Delpey
- Geoffrey Rigal