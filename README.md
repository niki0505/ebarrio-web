# eBarrio

eBarrio is a web application that facilitates barangay administrative tasks and enhance emergency response operations.

**Link to project:** https://ebarrio.online 

<p align="center">
  <img alt="image" src="https://github.com/user-attachments/assets/fc3e51f7-4eab-486f-ad8d-30c26bfb6e33" width="45%" />
  <img alt="image" src="https://github.com/user-attachments/assets/401bd291-7e3a-458e-bf66-23803a1e7b41" width="45%" />
  <img  width="45%"  alt="image" src="https://github.com/user-attachments/assets/a1b2d721-856f-42b3-973d-15221bf884d3" />
  <img  width="45%"  alt="image" src="https://github.com/user-attachments/assets/bb6deb56-5af3-46ac-88a0-22e16cb19025" />
  <img width="45%" alt="image" src="https://github.com/user-attachments/assets/2eba703d-9a2b-48bf-b715-f99d9d6db66e" />
  <img width="45%"  alt="image" src="https://github.com/user-attachments/assets/13f746a8-e653-4bae-a37d-e17786bc1c14" />
  <img  width="45%"  alt="image" src="https://github.com/user-attachments/assets/ca2483cc-07a2-4299-9e6d-bea6e6787f3a" />
  <img  width="45%"  alt="image" src="https://github.com/user-attachments/assets/4aefabcf-0b1e-4fb8-834d-d6250a4ad1cc" />
  <img width="45% alt="image" src="https://github.com/user-attachments/assets/6aed44e2-f56d-41c3-8f9e-2700d44577b9" />
  <img width="45% alt="image" src="https://github.com/user-attachments/assets/e79d3bab-41f2-406a-b4bd-eb557c6219da" />
  <img width="45%" alt="image" src="https://github.com/user-attachments/assets/4ed90a86-03b7-4ac2-9247-644cdecc75f0" />
  <img width="45%" alt="image" src="https://github.com/user-attachments/assets/bb9212fc-efc6-4617-8b69-58c567702607" />
</p>

# 🧩 Installation
## Steps
### Clone the backend
```bash
git clone https://github.com/niki0505/ebarrio-web-backend.git
cd ebarrio-web-backend
npm install
```
### Environment Setup
1. ### Create a .env file in the root directory of the backend project and add the required environment variables.
```bash
PORT=5000
DATABASE_URL=your-mongodb-connection
ACCESS_SECRET=your-access-secret
REFRESH_SECRET=your-refresh-secret
REDIS_URL=your-redis-connection
GEMINI_API_KEY=your-gemini-key
SEMAPHORE_KEY=your-semaphore-key
```
2. ### Save the file
3. ### Run the backend
```bash
npm run dev
```
>💡 Make sure not to upload your ".env" file to GitHub for security reasons.

> The backend will run on http://localhost:5000 by default.
### Clone and run the frontend
```bash
git clone https://github.com/niki0505/ebarrio-web.git
cd ebarrio-web
npm install
npm start
```
> The frontend will run on http://localhost:3000 by default.

# 🚀 How to Use
1. ### Access the Application
   - After running both frontend and backend, go to:
     ```
     http://localhost:3000
     ```
2. ### Create the Initial User (Technical Admin)
   - The system requires a **Technical Admin** account to manage barangay residents, households, employees, user accounts, and activity logs.
   - Since passwords are encrypted using **bcrypt**, you **cannot directly insert plain text passwords** into the database.
   - You can create this account by manually inserting the user into the database with a **bcrypt-hashed password**.
     ```json
     {
     "username": "your-username",
     "password": "your-bcrypt-hashed-password",
     "role": "Technical Admin",
     "mobilenumber": "your-mobile-number",
     "status": "Inactive"
     }
     ```
>💡 You can generate a bcrypt hash using an online bcrypt generator or a simple Node.js script.

Example command
```
node -e "console.log(require('bcrypt').hashSync('yourPassword', 10))"
```
3. ### Login
   - Use the credentials you created for Technical Admin.
   - Once logged in, you can add barangay residents, households, employees, user accounts, and manage activity logs.


