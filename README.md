# Blog API

A Node.js + Express REST API for blogging platform where users can write, edit,
and delete blog posts. Other users can read and comment on blog
posts. Implement user roles, such as admins and regular users.

---

## Features

- User registration & login (JWT authentication)
- CRUD operations for blog post
- Comment system for blog posts
- MongoDB + Mongoose for data persistence

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **File Uploads:** Multer and cloudinary
- **Other Tools:** bcrypt, dotenv, nodemon

---

| Method   | Endpoint              | Description           | Auth Required | Admin Auth Required |
| -------- | --------------------- | --------------------- | ------------- | ------------------- |
| **User** |                       |                       |               |
| POST     | `/createUser`         | Register a new user   | No            | No                  |
| POST     | `/login`              | Login and get JWT     | No            | No                  |
| GET      | `/getUsers`           | Get all users         | Yes           | Yes                 |
| GET      | `/getUserByID/:id`    | Get a particular user | Yes           | Yes                 |
| PUT      | `/updateUser/:id`     | Update user           | Yes           | No                  |
| **Post** |                       |                       |               |
| POST     | `/newPost`            | Make a new post       | No            | No                  |
| PUT      | `/updatePost/:postId` | Update a post         | No            | No                  |
| GET      | `/getPost/:postId`    | Get a post            | No            | No                  |
| GET      | `/getPosts`           | Get all user post     | Yes           | No                  |
| DELETE   | `/deletePost/:postId` | Delete a post         | No            | Yes                 |
