# Meeting Scheduler Frontend 🗓️

[![License](https://img.shields.io/badge/license-Unlicensed-red.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=react&logoColor=black)]()
[![Vite](https://img.shields.io/badge/Vite-808080?style=flat&logo=vite&logoColor=black)]()

## Description 📝

The Meeting Scheduler Frontend is a React application built with TypeScript and Vite that allows users to book and manage meetings. It provides a user-friendly interface for scheduling meetings, taking into account working hours, timezones, and blackout dates. Organizers can define their availability, and users can book time slots within those constraints. The application uses a variety of libraries and frameworks including React Router, Date-fns, Luxon, and Tailwind CSS to provide a rich and responsive experience.

## Table of Contents 🧭

- [Features ✨](#features-%E2%9C%A8)
- [Tech Stack 💻](#tech-stack-%F0%9F%92%BB)
- [Installation 🛠️](#installation-%E2%9B%A2%EF%B8%8F)
- [Usage 🚀](#usage-%F0%9F%9A%80)
- [How to Use 👨‍🏫](#how-to-use-%F0%9F%91%A8%E2%80%8D%F0%9F%91%A9)
- [Project Structure 📂](#project-structure-%F0%9F%93%81)
- [Contributing 🙌](#contributing-%F0%9F%99%8C)
- [License 📜](#license-%F0%9F%93%9C)
- [Important links 🔗](#important-links-%F0%9F%94%97)
- [Footer 👣](#footer-%F0%9F%91%A3)

## Features ✨

- **Meeting Scheduling:** Allows users to book meeting slots based on organizer's availability. 🗓️
- **Timezone Support:** Handles meeting schedules across different timezones using `date-fns-tz` and `luxon`. 🌍
- **Working Hours:** Organizers can define their working hours, and only those slots are available for booking. 🕒
- **Blackout Dates:** Ability to specify blackout dates when no meetings can be scheduled. 🚫
- **Buffer Times:** Option to add buffer time before and after meetings. ⏳
- **Minimum Notice:** Set a minimum notice period before a meeting can be booked. ⏰
- **Alerts:** Displays alerts for various scenarios like successful booking, errors, or invalid inputs. ⚠️
- **Dashboard:** A protected route for organizers to view and manage their settings. 📊
- **Settings Page:** Protected route for organizers to configure meeting parameters. ⚙️
- **Form Validation:** Input validation for booking form to ensure data integrity. ✅
- **Layout Component:** Reusable layout with sidebar navigation. 🧱

## Tech Stack 💻

- **Frontend:**
    - [React](https://reactjs.org/) - A JavaScript library for building user interfaces. ⚛️
    - [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript that compiles to plain JavaScript. 🟦
    - [Vite](https://vitejs.dev/) - A build tool that aims to provide a faster and leaner development experience for modern web projects. ⚡
    - [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapidly styling custom designs. 🎨
    - [React Router DOM](https://reactrouter.com/web/guides/quick-start) - Provides routing functionalities for the React application. 🛣️
    - [@headlessui/react](https://headlessui.com/react/menu) - Unstyled, fully accessible UI components. 👤
    - [@heroicons/react](https://heroicons.com/) - Beautiful hand-crafted SVG icons. 🦸
    - [Axios](https://axios-http.com/docs/intro) - Promise based HTTP client for the browser and node.js. 📡
    - [Date-fns](https://date-fns.org/) - Modern JavaScript date utility library. 📅
    - [Date-fns-tz](https://github.com/marnusw/date-fns-tz) - Time Zone support for date-fns. 🌍
    - [Luxon](https://moment.github.io/luxon/#/) - A library for working with dates and times in JavaScript. ⏱️
    - [React Datepicker](https://www.npmjs.com/package/react-datepicker) - A simple and customizable datepicker component for React. 📆
    - [Flowbite](https://flowbite.com/) - Open-source UI component library built on top of Tailwind CSS. 🧩
    - [Lucide React](https://lucide.dev/) - Beautifully simple, pixel-perfect icons. ✨

- **Backend Interaction:**
    - [Axios](https://axios-http.com/) - Used for making HTTP requests to the backend API. 🌐

- **Other Dependencies:**
    - [cors](https://github.com/expressjs/cors) - CORS middleware for Node.js.

## Installation 🛠️

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/semmysuihana/meeting-scheduler-frontend.git
    cd meeting-scheduler-frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

## Usage 🚀

1.  **Start the development server:**

    ```bash
    npm run dev
    ```

    This command starts the Vite development server with hot module replacement (HMR) enabled.

2.  **Open your browser and navigate to the address shown in the console (typically `http://localhost:5173`).** 🌐

3.  **Accessing the Application:**
    - The home page (`/`) displays a list of organizers. 🏠
    - Click on the "Book" button to navigate to the booking page for a specific organizer (`/book/:id`). 📖
    - The booking page allows users to select a date and time for a meeting. ✍️
    - The `organizer/:id/dashboard`, `organizer/:id/booking`, and `organizer/:id/settings` routes are protected behind a `Layout` component, which provides a consistent sidebar and navbar. 🔒

## How to Use 👨‍🏫

The Meeting Scheduler Frontend provides an intuitive interface for scheduling meetings:

1.  **As a User/Guest:**
    - Browse the list of available organizers on the homepage (`/`).
    - Click the "Book" button next to an organizer to view their availability and book a meeting.
    - Fill out the form with your name, email, and desired meeting time.
    - Submit the form to book the meeting.

2.  **As an Organizer:**
    - Access the dashboard (`/organizer/:id/dashboard`) to view meeting statistics.
    - Configure your settings (`/organizer/:id/settings`), including:
        - General information (name, timezone, etc.)
        - Working hours (days and times you are available for meetings)
        - Blackout dates (days you are unavailable for meetings)

## Project Structure 📂

```
meeting-scheduler-frontend/
├── .env
├── .eslintrc.cjs
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── api/
│   │   ├── ApiClient.tsx
│   │   └── tsconfig.json
│   ├── assets/
│   ├── component/
│   │   ├── Layout.tsx
│   │   ├── Loading.tsx
│   │   ├── Navbar.tsx
│   │   ├── RealtimeClock.tsx
│   │   ├── ShowAlert.tsx
│   │   └── Timepicker.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── pages/
│   │   ├── Booking.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DetailBook.tsx
│   │   ├── EditSetting.tsx
│   │   ├── Home.tsx
│   │   ├── NotFound.tsx
│   │   └── Settings.tsx
│   ├── tsconfig.app.json
│   └── vite-env.d.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

-   **`.env`**: Environment variables.
-   **`index.html`**: Main HTML entry point.
-   **`package.json`**: Lists project dependencies and scripts.
-   **`src/`**: Contains the main application code.
    -   **`App.tsx`**: Main application component, defines routes.
    -   **`api/ApiClient.tsx`**: Handles API requests.
    -   **`component/`**: Reusable React components.
        -   `Layout.tsx`: Defines the layout with sidebar navigation.
        -   `Navbar.tsx`: Defines the navigation bar with realtime clock.
        -   `RealtimeClock.tsx`: Component to display realtime clock according to timezone.
        -   `Loading.tsx`: Component to display loading animation.
        -   `ShowAlert.tsx`: Component to display alerts.
        -   `Timepicker.tsx`: Component related to handling timezones, converting working hours etc.
    -   **`pages/`**: Contains different pages of the application.
        -   `Home.tsx`: Main page displaying list of organizers.
        -   `DetailBook.tsx`: Page to book meeting with specific organizer.
        -   `Dashboard.tsx`: Dashboard page for organizers.
        -   `Booking.tsx`: Booking page (currently contains placeholder).
        -   `Settings.tsx`: Settings page for organizers.
        -   `EditSetting.tsx`: Component for edit settings
        -   `NotFound.tsx`: Page displayed when a route is not found.
-   **`vite.config.ts`**: Vite configuration file.
-   **`tsconfig.json`**: TypeScript configuration file.
-   **`tailwind.config.js`**: Tailwind CSS configuration file.
-   **`postcss.config.js`**: PostCSS configuration file.
-   **`eslint.config.js`**: ESLint configuration file.

## Contributing 🙌

Contributions are always welcome!

If you have suggestions for improvement, feel free to fork the repository, make changes, and submit a pull request.

## License 📜

This project is unlicensed.

## Important links 🔗
- Repository Link:[Meeting Scheduler Frontend](https://github.com/semmysuihana/meeting-scheduler-frontend)

## Footer 👣

Meeting Scheduler Frontend - [https://github.com/semmysuihana/meeting-scheduler-frontend](https://github.com/semmysuihana/meeting-scheduler-frontend) by [semmysuihana](https://github.com/semmysuihana) - Feel free to fork, star, and open issues! ✨


---
**<p align="center">Generated by [ReadmeCodeGen](https://www.readmecodegen.com/)</p>**