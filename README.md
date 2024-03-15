# WhoSaidIt

### Table of Contents
1. [Overview](#overview)
2. [Deployed Application Links](#deployed-application-links)
3. [Technology Stack](#technology-stack)
4. [About the Author](#about-the-author)
5. [Development Instructions](#development-instructions)
6. [Attribution](#attribution)
7. [License Disclaimer](#license-disclaimer)

## Overview

**WhoSaidIt** is a web application where you can create and share quizzes drawn from the messages in your WhatsApp group chats. Quizzes present the player with a message from the chat, where they must then determine *Who Said It*! Compete against your friends for the high score!

### Features Include:

- Securely managed **user accounts** for uploading and managing exported WhatsApp group chats.
- **Creating quizzes** of two varieties:
    - **Time Attack** - Players answer a set number of questions as quickly as possible to achieve the highest score. Faster answers yield greater rewards.
    - **Survival** - Players compete for the longest streak of consecutive correct answers. One wrong answer ends your run!
- **Customizing quizzes** by selecting your favorite iconic messages from your friends using the **messages browser**.
- Generating **shareable links** that allow your friends to play your quiz, no account required!
- Competing for **high scores** against your friends on the **shared leaderboard**.
- A handcrafted, responsively designed interface that offers a seamless and rewarding user experience.
- And more...

## Deployed Application Links

### Main application: **[https://whosaidit.app](https://whosaidit.app)**
Deployed backend API documentation: [https://api.whosaidit.app/api-docs](https://api.whosaidit.app/api-docs)

## Technology Stack

WhoSaidIt consists of a frontend client-side application and a backend server-side application that communicates with a database.

### Frontend
Built using **TypeScript** and the **[NextJS React framework](https://nextjs.org/)**, WhoSaidIt utilizes several features unique to NextJS, including server-side proxy API endpoints (for managing HTTP-only refresh jwts) and the *App Router* with dynamic route parameters. The interface was styled using **[TailwindCSS](https://tailwindcss.com/)**, which allows for seamless integration of CSS into JSX code.

### Backend
The backend application is built using **[SpringBoot](https://spring.io/projects/spring-boot)**, **[Spring Data JPA](https://spring.io/projects/spring-data-jpa)**, and **[Spring Security](https://spring.io/projects/spring-security)** for the construction of the REST API, database integration, and authentication/access-control systems respectively. The database itself uses **[PostgreSQL](https://www.postgresql.org/)** for the advantages of an object-relational structure.

## About the Author

WhoSaidIt was developed by **Nathan Raymant**, a University of Toronto graduate with an H.B.Sc. in Computational Cognitive Science, Computer Science, and Mathematics. With an undying passion for creating accessible, well-designed software, the application was developed with two fundamental goals in mind:

1. To create a fun and engaging way for friends to laugh while reminiscing over their shared past, and to facilitate lighthearted competition that reveals who knows their friends the best!

2. To improve his skills as a developer by learning new frameworks and technologies, and to push his own personal limits as a designer and engineer by architecting a large scale application using a sensible and extensible methodology.

#### Contact Information
- Phone: +1 (313) 410 3667
- Email: nathanraymant@gmail.com

## Development Instructions

Any enterprising developers are free to improve upon the original design, so long as they follow the conditions outlined in the license (GPLv3.0, see [LICENSE](https://github.com/Nathan7934/WhoSaidIt/blob/master/LICENSE)). This repository is open to pull request submissions, but you may also fork it.

#### To get started developing on your personal machine, you will need:
- **[NodeJS](https://nodejs.org/en)** and **[NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)**
- **[PostgreSQL Server](https://www.postgresql.org/download/)**
- **[Docker](https://www.docker.com/products/docker-desktop/)** (optional)

### Frontend Development

To develop the NextJS frontend, first clone the repository and create a file called `.env.local` in the `/frontend` directory with the following contents:

```
NEXT_PUBLIC_EXTERNAL_API_URL=http://localhost:8080
NEXT_PUBLIC_DOMAIN_URL=http://localhost:3000
```

Then, enter the following commands:
```bash
# From the root directory
cd frontend
npm install
npm run dev # Start the development server
```
To get the backend running, simply use *Docker Compose* (provided Docker is installed):
```bash
# From the root directory
cd backend
docker-compose -f ./docker-compose.dev.yml up -d --build
```
This will configure and run a multi-container environment for both the backend application and the PostgreSQL server, listening on **http://localhost:8080**.

In a browser, connect to your NextJS development server on **http://localhost:3000**.

### Backend Development

To develop the SpringBoot backend, you can use `docker-compose`, but it will likely be easier to run the application and database in your local environment.

First, start your PostgreSQL server on the default port and create a database named `whosaidit-db`. This can be done using bash, or more easily by using the **pgAdmin** interface (bundled with PostgreSQL). Hibernate will automatically configure the database schema when you run the backend application.

Define the following two environment variables (values are arbitrary for dev purposes):
```
WHOSAIDIT_JWT_SECRET=ZGV2LWp3dC1zZWNyZXQtZHVtbXktdmFsdWU=
SENDGRID_API_KEY=SG.DUMMY_VALUE_FOR_DEVELOPMENT
```

Next, install the Maven dependencies for the backend application. This is can be done in most IDEs (e.g. **IntelliJ**), or you can run the command:
```bash
# From root directory
cd backend
mvn clean install
```

Finally, start the backend application using your IDE of choice, using `BackendApplication.java` as the entrypoint.

## Attribution

While the majority of WhoSaidIt was developed from the ground-up, some visual assets and lightweight animation libraries were used. They include (but are not limited to):

- [Feather Icons](https://www.iconfinder.com/search/icons?family=feather) (Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))
- [Animate.css](https://animate.style/) (Licensed under [HL3](https://firstdonoharm.dev/))

For all packages used, see `package.json` in the `/frontend` directory.

## License Disclaimer

For the full terms and conditions, see [LICENSE](https://github.com/Nathan7934/WhoSaidIt/blob/master/LICENSE).

    WhoSaidIt - A quiz app for friends to test how well they know each other.
    Copyright (C) 2024  Nathan Christian Raymant

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details