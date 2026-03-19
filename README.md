# eBarrio

eBarrio is a web application that facilitates barangay administrative tasks and enhance emergency response operations.

**Link to project:** https://ebarrio.online 

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


