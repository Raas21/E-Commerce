# E-commerce Platform with AI Chatbot & Visualization

This repository contains the **E-commerce Platform with AI Chatbot & Visualization** mini project — a web application for managing suppliers with AI-powered suggestions. It is built using an **Angular 19** front-end and a **Spring Boot** back-end, integrated with the **Groq API** for AI recommendations. Users can perform CRUD operations on suppliers and get intelligent suggestions based on criteria like delivery time.

---

## 📑 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running the Project](#running-the-project)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
  
---

## ✅ Features

- **Supplier Management**: Create, read, update, and delete suppliers with fields like item, delivery time, and rejection rate.
- **AI Suggestions**: Get supplier recommendations using the Groq API (e.g., "Suggest a supplier for fast delivery").
- **Form Validation**: Ensures valid input (e.g., rejection rate must be between 0 and 1).
- **Responsive UI**: Clean, user-friendly interface for managing suppliers and viewing suggestions.

---

## 🧰 Tech Stack

| Layer        | Technology                           |
|--------------|---------------------------------------|
| Front-end    | Angular 19, TypeScript, HTML, CSS     |
| Back-end     | Spring Boot (Java), Maven             |
| AI Integration | Groq API (`llama-3.3-70b-versatile`) |
| Database     | H2 (in-memory)                        |
| Tools        | Git, GitHub, VS Code, Windows cmd     |

---

## 📋 Prerequisites

Ensure the following are installed:

- **Node.js and npm**: v18+ – [Download](https://nodejs.org/)
- **Angular CLI**: Install via `npm install -g @angular/cli@19`
- **Java JDK**: JDK 17+ – [Oracle](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or [AdoptOpenJDK](https://adoptium.net/)
- **Maven**: [Download](https://maven.apache.org/)
- **Git**: [Download](https://git-scm.com/)
- **VS Code** (optional): [Download](https://code.visualstudio.com/)
- **Groq API Key**: [Sign up](https://console.groq.com/)
- **Windows Command Prompt**: Already available in Windows

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
cd C:\Ram
git clone https://github.com/Raas21/evolving-ui-mini.git
cd evolving-ui-mini
```

### 2. Set Up the Front-end

```bash
cd frontend\evolving-ui
npm install
```

> Add your Groq API key:
>
> Open `src/app/services/llm.service.ts` and replace:
>
> ```ts
> private apiKey = 'YOUR_GROQ_API_KEY'; // Replace with your key
> ```
> with:
>
> ```ts
> private apiKey = 'gsk_abc123...'; // your actual key
> ```

### 3. Set Up the Back-end

```bash
cd ..\backend
mvn clean install
```

---

## 🚀 Running the Project

### 1. Run the Back-end

```bash
cd C:\Ram\evolving-ui-mini\backend
mvn spring-boot:run
```

> Backend runs at `http://localhost:8080` using an in-memory H2 database.

### 2. Run the Front-end

Open a new terminal window:

```bash
cd C:\Ram\evolving-ui-mini\frontend\evolving-ui
ng serve
```

> Frontend runs at `http://localhost:4200`

---

## 💡 Usage

### Access the App

Go to [http://localhost:4200](http://localhost:4200)

### Add a Supplier

- Fill in fields like `Item`, `Delivery Time`, and `Rejection Rate`
- Click **Add Supplier** to save

### Edit a Supplier

- Click **Edit**, update fields, then click **Save** or **Cancel**

### Delete a Supplier

- Click **Delete**, confirm to remove the entry

### Get an AI Suggestion

- Enter a prompt (e.g., _"Suggest a supplier for fast delivery..."_)
- Click **Get Suggestion**
- Response appears below

### View Errors

- Errors (e.g., API/auth issues, invalid form input) appear in red text

---

## 🛠 Troubleshooting

### Back-end Fails to Start

- Ensure JDK 17+ and Maven are installed
- Port 8080 in use? Change it in:
  ```
  backend/src/main/resources/application.properties
  server.port=8081
  ```

### Front-end Doesn’t Load

- Confirm `ng serve` is running
- Check browser console (F12 → Console tab) for errors

### AI Suggestion Fails (401 Error)

- Recheck your Groq API key in `llm.service.ts`
- Ensure it's valid (see [console.groq.com](https://console.groq.com))

### Suppliers Not Loading

- Ensure back-end is running
- Open DevTools (F12 → Network tab) to see errors

---

## 📁 Project Structure

```
evolving-ui-mini/
├── backend/                        # Spring Boot back-end
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/              # Controllers, services, models
│   │   │   └── resources/         # application.properties
│   │   └── test/                  # Unit tests
│   └── pom.xml                    # Maven config
├── frontend/
│   └── evolving-ui/
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/
│       │   │   │   └── supplier-list/  # Main UI component
│       │   │   ├── services/      # LLM service
│       │   │   └── models/        # Supplier model
│       │   └── environments/      # Environment configs
│       ├── package.json           # Front-end dependencies
│       └── angular.json           # Angular config
├── .gitignore
└── README.md
```

