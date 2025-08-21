# 🛒 E-commerce Backend (Node.js + MySQL)

Bu loyiha **E-commerce platforma** uchun qurilgan **RESTful API** hisoblanadi.  
Texnologiyalar: **Node.js**, **Express**, **Objection.js (MySQL ORM)** va **Swagger (OpenAPI 3.0)**.  

API orqali **foydalanuvchilarni ro‘yxatdan o‘tkazish, mahsulotlarni boshqarish, buyurtmalarni qabul qilish, to‘lovlar bilan ishlash va rasm yuklash** mumkin.  

---

## ✨ Xususiyatlar
- 👥 **User Authentication & Authorization (JWT)**  
- 📦 **Products CRUD** (qo‘shish, o‘chirish, yangilash) + rasm yuklash  
- 🗂 **Categories boshqaruvi**  
- 🛒 **Orders** (bir nechta mahsulotlar bilan buyurtma berish)  
- 💳 **Payments integratsiya (mock + provider callbacks)**  
- 📸 **Mahsulotga bir nechta rasm yuklash (upload, delete, reorder)**  
- 📖 **Swagger API hujjatlari** (`/docs`)  
- 🔐 Xavfsizlik (rate limit, XSS-clean, helmet, CORS)  
- 📝 **Markazlashgan error handling va logging (pino)**  

---

## 🛠 Texnologiyalar
- **Runtime:** Node.js (v18+)  
- **Framework:** Express.js  
- **Database:** MySQL (Objection.js + Knex.js)  
- **Auth:** JWT (access/refresh tokens)  
- **File Uploads:** Multer  
- **Docs:** Swagger (OpenAPI 3.0)  
- **Logger:** Pino  
- **Security:** Helmet, Rate-limiter, XSS-clean  

---

## 📂 Loyihaning tuzilishi
```bash bunyod-backend/
│── controllers/ # Route handlerlar
│── routes/ # Express router fayllari
│── models/ # Objection.js model fayllari
│── middlewares/ # Auth, error handler, validation middleware
│── utils/ # Yordamchi funksiyalar (db, logger va h.k.)
│── docs/ # Swagger konfiguratsiyasi
│── uploads/ # Yuklangan product image fayllari
│── index.js # Asosiy app entry point
│── db.js # Database ulanish konfiguratsiyasi
│── knexfile.js # Knex migration sozlamalari
│── .env # Muhit sozlamalari
│── .gitignore
│── package.json
```

## ⚙️ O‘rnatish va Sozlash

### 1. Reponi clone qilish
```bash
git clone https://github.com/username/ecommerce-backend.git
cd ecommerce-backend

npm install


PORT=4000
NODE_ENV=development
DATABASE_URL=mysql://root:password@localhost:3306/ecommerce
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

```

##  📖 API hujjatlari

Server ishga tushgach, Swagger UI orqali API hujjatlari:
👉 http://localhost:4000/docs

🔑 API modullari

Auth & Users

Products (CRUD + Images)

Categories

Orders

Payments

Uploads




## 🛡 Xavfsizlik

Rate limiting (ko‘p urinishlarga qarshi)

XSS-clean (input sanitizatsiya)

Helmet (HTTP headerlarni himoyalash)

JWT token-based auth

Parollar bcrypt bilan hash qilinadi


## 📌 Reja (TODO)

 Stripe/Payme/Click kabi to‘lov providerlari integratsiyasi

 Admin panel uchun maxsus API route’lar

 Unit va integration testlar (Jest)

---

✅ Endi bu faylni loyihangizning **ildiz papkasida** `README.md` nomi bilan saqlaysiz.  
Frontendchilar ham, backendchilar ham, hatto yangi qo‘shilgan developer ham loyiha haqida hammasini tushunib oladi.  

---

❓ README ichiga **Swagger JSON export linkini** ham qo‘shib qo‘yaymi, shunda frontendchilar uni **Postman/Insomnia** ga import qilib ishlata olishadi?
