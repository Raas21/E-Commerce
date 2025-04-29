Evolving UI Design Mini Project
This repository contains the Evolving UI Design mini project, a web application for managing suppliers with AI-powered suggestions. The project is built with an Angular 19 front-end and a Spring Boot back-end, integrating the Groq API for AI suggestions. It allows users to perform CRUD operations on suppliers and get recommendations based on criteria like delivery time.
Table of Contents

Features
Tech Stack
Prerequisites
Setup Instructions
Running the Project
Usage
Troubleshooting
Project Structure
Contributing
License

Features

Supplier Management: Create, read, update, and delete (CRUD) suppliers with fields like item, delivery time, and rejection rate.
AI Suggestions: Get supplier recommendations using the Groq API (e.g., "Suggest a supplier for fast delivery").
Form Validation: Ensures valid input for supplier data (e.g., rejection rate between 0 and 1).
Responsive UI: Clean and user-friendly interface for managing suppliers and viewing AI suggestions.

Tech Stack

Front-end: Angular 19, TypeScript, HTML, CSS
Back-end: Spring Boot (Java), Maven
AI Integration: Groq API (llama-3.3-70b-versatile model)
Database: H2 (in-memory, for development)
Version Control: Git, GitHub
Development Tools: VS Code, Windows Command Prompt

Prerequisites
To run this project locally, ensure you have the following installed:

Node.js and npm: Version 18 or later. Download from nodejs.org.
Angular CLI: Install globally with npm install -g @angular/cli@19.
Java Development Kit (JDK): JDK 17 or later. Download from Oracle or AdoptOpenJDK.
Maven: For building the Spring Boot back-end. Download from maven.apache.org.
Git: To clone the repository. Download from git-scm.com.
VS Code: Recommended for editing (optional). Download from code.visualstudio.com.
Grok API Key: Required for AI suggestions. Sign up at console.groq.com to get your API key.
Windows Command Prompt (cmd): Already available on Windows.

Setup Instructions
Follow these steps to set up the project on your local machine.
1. Clone the Repository
Open Command Prompt and run:
cd C:\Ram
git clone https://github.com/Raas21/evolving-ui-mini.git
cd evolving-ui-mini

2. Set Up the Front-end

Navigate to the front-end directory:cd frontend\evolving-ui


Install dependencies:npm install


Add your Groq API key:
Open src/app/services/llm.service.ts in VS Code.
Replace 'YOUR_GROQ_API_KEY' with your actual Groq API key (e.g., gsk_abc123...):private apiKey = 'gsk_abc123...'; // Replace with your key


Save the file.



3. Set Up the Back-end

Navigate to the back-end directory:cd ..\backend


Install Maven dependencies:mvn clean install



Running the Project
The project consists of two parts: the back-end (Spring Boot) and the front-end (Angular). Both need to be running for the app to work.
1. Run the Back-end

From the backend directory:cd C:\Ram\evolving-ui-mini\backend
mvn spring-boot:run


The back-end will start on http://localhost:8080.
It uses an in-memory H2 database, so no additional database setup is needed.



2. Run the Front-end

Open a new Command Prompt window and navigate to the front-end directory:cd C:\Ram\evolving-ui-mini\frontend\evolving-ui


Start the Angular development server:ng serve


The front-end will be available at http://localhost:4200.

Usage

Access the App:
Open your browser and go to http://localhost:4200.


Add a Supplier:
In the "Add New Supplier" section, enter details (e.g., Item: ITEM001, Delivery Time: 4, Rejection Rate: 0.02).
Click "Add Supplier" to save. The supplier will appear in the table below.


Edit a Supplier:
In the table, click "Edit" on a supplier.
Update the fields and click "Save" (or "Cancel" to discard changes).


Delete a Supplier:
Click "Delete" on a supplier and confirm to remove it.


Get an AI Suggestion:
In the "Get Supplier Suggestion" section, enter a prompt (e.g., "Suggest a supplier for fast delivery along with all associated parameters\nPlease do not give reasoning").
Click "Get Suggestion". The AI response (e.g., "ID: 1, item: ITEM001, Delivery Time: 4 days, Rejection Rate: 0.02") will appear below.


View Errors:
If something goes wrong (e.g., invalid input, API error), an error message will appear in red.



Troubleshooting

Back-end Fails to Start:
Ensure JDK 17 and Maven are installed.
Check for port conflicts on 8080. Stop other apps using the port or change the port in backend/src/main/resources/application.properties:server.port=8081




Front-end Doesn’t Load:
Verify ng serve is running.
Open Chrome DevTools (F12) and check the Console for errors.


AI Suggestions Fail (401 Error):
Double-check your Groq API key in llm.service.ts.
Ensure your API key has not expired (check console.groq.com).


Suppliers Not Loading:
Ensure the back-end is running on http://localhost:8080.
Check the Console (F12) for network errors.



Project Structure
evolving-ui-mini/
├── backend/                        # Spring Boot back-end
│   ├── src/                        # Java source code
│   │   ├── main/
│   │   │   ├── java/              # Java classes (controllers, services, models)
│   │   │   └── resources/         # Configuration files (e.g., application.properties)
│   │   └── test/                  # Unit tests
│   └── pom.xml                    # Maven configuration
├── frontend/                       # Angular front-end
│   └── evolving-ui/
│       ├── src/                   # Angular source code
│       │   ├── app/               # Angular components, services, models
│       │   │   ├── components/
│       │   │   │   └── supplier-list/  # Supplier management component
│       │   │   ├── services/      # Services for API calls (e.g., llm.service.ts)
│       │   │   └── models/        # TypeScript models (e.g., supplier.model.ts)
│       │   └── environments/      # Environment configs (ignored in Git)
│       ├── package.json           # Front-end dependencies
│       └── angular.json           # Angular project config
├── .gitignore                     # Git ignore rules
└── README.md                      # This file


