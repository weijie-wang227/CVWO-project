Wang Weijie

Project SetUp Guide:

Prerequisites:

1. Node.js (frontend)
2. Golang (backend)
3. Mysql
4. Git
5. Vite

Backend Setup

1. Clone the Repository:
   git clone https://github.com/weijie-wang227/CVWO-project
   cd ./backend

2. Create a .env File:
   In the backend directory, create a .env file to store your local environment variables. Example:
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=mydatabase

3. Set Up the Database:
   Start your MySQL server and create a new database:
   CREATE DATABASE mydatabase;

4. Install Dependencies:
   go mod tidy

5. Run the Backend:
   go run main.go

The backend should now be running on http://localhost:8080.

Frontend Setup

1. Navigate to the Frontend Directory:
   cd ./frontend

2. Install Dependencies:
   npm install

3. Create a .env File:
   In the backend directory, create a .env file to store url of backend.
   const API_URL = 'http://localhost:8080';

4. Run the Frontend:
   npm run dev

The frontend should now be accessible on http://localhost:5173.
