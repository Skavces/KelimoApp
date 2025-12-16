# 🇬🇧 KelimoApp

> A full-stack, gamified vocabulary learning platform built with **NestJS** and **React**.

KelimoApp is designed to make language learning addictive and effective. It uses a Tinder-style swipe mechanic for learning new words, spaced repetition logic, and interactive mini-games to reinforce memory.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📸 Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/aa1c48cf-5ff9-4deb-92ab-9dcfb40ab9b2" width="900" style="border-radius: 10px; margin-bottom: 20px;" />
  
  <br><br>

  <img src="https://github.com/user-attachments/assets/8d567913-11a9-4501-8fd6-9533a32e888b" width="45%" style="border-radius: 10px; margin-right: 10px;" />
  <img src="https://github.com/user-attachments/assets/00aa5716-732b-4f8e-9460-4cd73e9e42f2" width="45%" style="border-radius: 10px;" />
</div>

## ✨ Key Features

### 🎯 Core Learning
* **Swipe to Learn:** Interactive card system. Swipe right if you know it, left if you don't.
* **Spaced Repetition:** The app tracks your progress and resurfaces words you struggle with.
* **Real-time Stats:** Track your daily streak, total learned words, and accuracy rates.

### 🎮 Mini-Games (Practice Center)
* **Word Scramble:** Unjumble letters to form the correct word.
* **Fill in the Blank:** Context-based sentence completion.
* **Memory Match:** Classic card flipping game to match words with meanings.
* **Dictation (Listen & Type):** Test your listening and spelling skills with native audio.

### 👤 User Experience
* **Modern UI/UX:** Fully responsive design with Dark Mode support.
* **Profile Customization:** Upload and crop your profile avatar.
* **Google Auth:** Seamless and secure login.

## 🛠 Tech Stack

**Backend**
* ![NestJS](https://img.shields.io/badge/-NestJS-E0234E?style=flat&logo=nestjs&logoColor=white) **NestJS** - Progressive Node.js framework.
* ![Prisma](https://img.shields.io/badge/-Prisma-2D3748?style=flat&logo=prisma&logoColor=white) **Prisma** - Next-generation ORM.
* ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white) **PostgreSQL** - Relational database.
* **Cloudinary** - Image optimization and storage.

**Frontend**
* ![React](https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=black) **React** (Vite) - Fast and modular UI.
* ![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) **TypeScript** - Type safety.
* ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) **Tailwind CSS** - Utility-first styling.
* **Framer Motion** - Smooth animations and gestures.

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
* Node.js (v18+)
* PostgreSQL
* Cloudinary Account

### 1. Clone the repo
```bash
git clone [https://github.com/Skavces/kelime-uygulamasi.git](https://github.com/Skavces/kelime-uygulamasi.git)
cd kelime-uygulamasi
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file and fill in your DB and Cloudinary credentials
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start server
npm run start:dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3000" > .env

# Start client
npm run dev
```

## 🔐 Environment Variables

You need to configure these variables in `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/kelimoapp"
JWT_SECRET="your_super_secret_key"
CLOUDINARY_CLOUD_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"
GOOGLE_CLIENT_ID="xxx"
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Made by <a href="https://github.com/Skavces">Skavces</a>
</div>