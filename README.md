# 🤖 RAG AI Chat Bot

An intelligent AI-powered chatbot built with **React, Express, and MongoDB** that allows users to interact with AI based on admin-provided knowledge.

---

## 🚀 Features

✨ User Authentication

* Register new account
* Secure login system

💬 AI Chat System

* Ask questions in real-time
* AI responds based on admin posts

🧠 Admin Knowledge Control

* Admin can create posts (knowledge base)
* AI answers are generated from stored content

📦 Full-Stack Architecture

* Frontend: React
* Backend: Express.js
* Database: MongoDB

---

## 🛠️ Tech Stack

| Frontend | Backend    | Database | Other             |
| -------- | ---------- | -------- | ----------------- |
| React.js | Express.js | MongoDB  | Node.js, REST API |

---


## ⚙️ Installation

### 1️⃣ Clone the repository

```
git clone https://github.com/feyyu120/ChatBot.git
cd ChatBot
```

### 2️⃣ Install dependencies

#### frontend

```
cd frontend
npm install
```

#### backend

```
cd backend
npm install
```

---

## ▶️ Run the App

### Start Backend

```
cd backend
npm  run start
```

### Start Frontend

```
cd frontend
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file inside `/server`:

```
MONGO_URI= " "
JWT_SECRET= " "
PORT=5000
```

---

## 📡 API Overview

### Auth Routes

* `POST /api/auth/register`
* `POST /api/auth/login`


## 🧠 How It Works

1. Admin creates posts → stored in MongoDB
2. User asks a question
3. Backend processes the question
4. AI generates response based on stored posts
5. Response is sent back to user

---

## 🎯 Future Improvements

* 🤖 Integrate advanced AI (OpenAI API or similar)
* 📊 Admin dashboard analytics
* 🗂️ Categories for knowledge posts
* 🌍 Multi-language support
* ⚡ Real-time chat (WebSockets)

---

## 📸 Screenshots
Register.jsx

 <img width="1916" height="907" alt="Screenshot 2026-02-14 175849" src="https://github.com/user-attachments/assets/e648b774-16de-4cac-b174-e09edfd07a48" />
- - -
login.jsx

<img width="1908" height="891" alt="Screenshot 2026-02-14 175830" src="https://github.com/user-attachments/assets/d46ba805-c840-46ff-917f-df9ffdb91880" />
- - -
bot.jsx
<img width="1918" height="871" alt="Screenshot 2026-02-14 175009" src="https://github.com/user-attachments/assets/2c2b0584-1b7d-4848-8e5e-b783439a0848" />

<img width="1910" height="869" alt="Screenshot 2026-02-14 175038" src="https://github.com/user-attachments/assets/a1f08ee6-6358-4394-90ca-3c960b228407" />
 - - - 
admin.jsx
<img width="1901" height="849" alt="Screenshot 2026-02-14 083201" src="https://github.com/user-attachments/assets/c35421b2-a951-4420-aacd-d2aeda9806c4" />

<img width="1899" height="887" alt="Screenshot 2026-02-14 083133" src="https://github.com/user-attachments/assets/ba2b95e3-137e-4f19-9995-c1bed6b72b77" />
- -  -
on mobile
<img width="416" height="768" alt="Screenshot 2026-02-14 082532" src="https://github.com/user-attachments/assets/1bc1166a-12ad-4000-ad70-2bf1d085390a" />

<img width="382" height="764" alt="Screenshot 2026-02-14 082559" src="https://github.com/user-attachments/assets/79605f26-e878-425c-9345-97cc8b8841c0" />

- - - 
on database like this 
<img width="1501" height="791" alt="Screenshot 2026-02-14 191207" src="https://github.com/user-attachments/assets/4e6d0445-d6eb-4ca3-9b3d-7c58762daf19" />

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork this repo and submit a pull request.

---


## 👨‍💻 Author

**Feysel Yassin**

* GitHub: https://github.com/feyyu120
* email: feyselfeyyu@gmail.com

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!




Feysel Yassin
