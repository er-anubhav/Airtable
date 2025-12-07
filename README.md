# Airtable Form Builder & Viewer

> [!CAUTION]
> **Status: Hosting Pending**
> The hosting for both Backend and Frontend is currently pending. Please follow the [Local Development](#-local-development) instructions to run the project.

A full-stack application that allows users to create custom forms for their Airtable bases, view them publicly, submit responses, and sync data back to Airtable. Features include OAuth authentication, conditional logic, and webhook integration.

## 📸 Screenshots

| Form Builder | Public Viewer |
|:---:|:---:|
| *(Screenshots Pending)* | *(Screenshots Pending)* |
| *Drag and drop interface* | *Responsive form validation* |

## Features

*   **Airtable OAuth**: Secure login and workspace access.
*   **Form Builder**: Drag-and-drop style configuration (Fields, logic, validation).
*   **Conditional Logic**: Show/Hide questions based on previous answers.
*   **Public Viewer**: Shareable links for forms.
*   **Airtable Sync**: Responses are instantly saved to your Airtable Base.
*   **Webhooks**: Listen for changes in Airtable (records deleted/updated).

---

## 🚀 Live Demo

*   **Frontend**: [Vercel Deployment Link Here](https://your-app.vercel.app)
*   **Backend**: [Railway Deployment Link Here](https://your-app.up.railway.app)

*(Note: You must configure `sample.env.example` with your own keys to run this yourself)*

---

## 🛠️ Project Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Compass or Atlas)
*   Airtable Account

### Local Development

1.  **Clone the repository**
    ```bash
    git clone <repo-url>
    cd airtable-form-builder
    ```

2.  **Backend Setup**
    ```bash
    # Install dependencies
    npm install

    # Copy env file
    cp sample.env.example .env

    # Run Database (if local)
    # mongod --dbpath /data/db
    
    # Start Development Server
    npm run dev
    ```
    *Server runs on `http://localhost:3000`*

3.  **Frontend Setup**
    ```bash
    cd Frontend
    npm install
    npm run dev
    ```
    *Client runs on `http://localhost:5173`*

---

## 🔑 Airtable OAuth Configuration

To make the login work, you need to register an OAuth app in Airtable.

1.  Go to [Airtable Builder Hub](https://airtable.com/create/oauth).
2.  Click **"Create new OAuth integration"**.
3.  **Name**: Form Builder
4.  **Redirect URI**:
    *   Local: `http://localhost:3000/api/auth/airtable/callback`
    *   Prod: `https://<YOUR_BACKEND_URL>/api/auth/airtable/callback`
5.  **Scopes** (Required):
    *   `data.records:read`
    *   `data.records:write`
    *   `schema.bases:read`
    *   `webhook:manage`
6.  Save correctly and copy `Client ID` and `Client Secret` to your `.env` file.

---

## ☁️ Deployment Guide

### 1. Database (MongoDB Atlas)
*   Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
*   Get the connection string: `mongodb+srv://<user>:<pass>@cluster...`.
*   Save this for the backend environment variable `MONGO_URI`.

### 2. Backend (Railway / Heroku / Render)
We recommend **Railway** for easiest deployment.

1.  Push your code to GitHub.
2.  Login to Railway and "Create New Project" -> "Deploy from GitHub repo".
3.  Select the **Root** directory.
4.  **Variables**: Add all variables from `sample.env.example`.
    *   `PORT`: `8080` (Railway sets this, or set it manually)
    *   `MONGO_URI`: Your Atlas connection string.
    *   `AIRTABLE_REDIRECT_URI`: Update domain to your Railway URL.
5.  **Build Command**: `npm run build`
6.  **Start Command**: `npm start`

### 3. Frontend (Vercel)
1.  Login to Vercel -> "Add New Project" -> Import GitHub repo.
2.  **Root Directory**: Edit to select `Frontend`.
3.  **Framework Preset**: Vite (Auto-detected).
4.  **Environment Variables**:
    *   No specific vars needed unless you want to hide the API URL. 
    *   Usually, you updated `Frontend/src/services/api/index.ts` to point to your Production Backend URL.
5.  Deploy!

---

## 📚 Data Model

### User
*   Stores Airtable tokens (`accessToken`, `refreshToken`).
*   Linked to Airtable User ID.

### Form
*   `questions`: List of fields + config (label, required, logic).
*   `airtableBaseId`, `airtableTableId`: Target destination.

### Submission
*   `answers`: JSON object of responses.
*   `airtableRecordId`: ID of the created row in Airtable.
*   `deletedInAirtable`: Boolean (synced via webhook).

---

## 🧠 Conditional Logic

The logic engine (`src/utils/conditionEvaluator.ts`) supports complex visibility rules.

*   **Structure**:
    ```json
    {
      "conditionLogic": "and", // or 'or'
      "conditionalRules": [
        { "dependsOn": "field_id_1", "operator": "equals", "value": "Yes" }
      ]
    }
    ```
*   **Operators**: `equals`, `not_equals`, `contains`, `greater_than`, `less_than`.
*   **Frontend**: Recursively checks rules to show/hide fields in real-time.

---

## 🪝 Webhooks

The backend automatically creates a webhook in Airtable when you save a form (`webhook:manage` scope).

*   **Endpoint**: `POST /api/webhooks/airtable`
*   **Events**:
    *   `DestroyModel`: If a record is deleted in Airtable, we mark the local submission as `deletedInAirtable: true`.
    *   `UpdateModel`: Logs changes to records.

---

*Verified Working on Windows 11 / Node v18*
