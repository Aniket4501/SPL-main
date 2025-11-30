# SPL Backend API

A Node.js + Express + PostgreSQL + Prisma ORM backend boilerplate for the Steps Premier League project.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Robust relational database
- **Prisma ORM** - Next-generation ORM for Node.js
- **File Upload** - Multer-based file upload with single and multiple file support
- **Validation** - Express-validator for request validation
- **Security** - Helmet.js for security headers
- **Logging** - Morgan for HTTP request logging
- **CORS** - Cross-origin resource sharing enabled

## 📁 Project Structure

```
SPL Backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── user.controller.js
│   │   ├── post.controller.js
│   │   └── upload.controller.js
│   ├── services/          # Business logic
│   │   ├── user.service.js
│   │   ├── post.service.js
│   │   └── upload.service.js
│   ├── routes/             # API routes
│   │   ├── index.js
│   │   ├── user.routes.js
│   │   ├── post.routes.js
│   │   └── upload.routes.js
│   ├── middleware/         # Custom middleware
│   │   └── upload.middleware.js
│   └── server.js           # Main server file
├── prisma/
│   └── schema.prisma       # Database schema
├── uploads/                # File upload directory
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE spl_db;
```

2. Update `.env` file with your database connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/spl_db?schema=public"
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/production)
- `UPLOAD_DIR` - Upload directory path
- `MAX_FILE_SIZE` - Maximum file size in bytes

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files (max 10)
- `GET /api/upload/files` - Get all uploaded files
- `GET /api/upload/files/:id` - Get file by ID
- `DELETE /api/upload/files/:id` - Delete file

## 📝 Example API Requests

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

### Upload File
```bash
curl -X POST http://localhost:3000/api/upload/single \
  -F "file=@/path/to/file.jpg"
```

### Create Post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content",
    "authorId": "user-uuid-here"
  }'
```

## 🗄️ Database Management

### Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

### Create Migration
```bash
npm run prisma:migrate
```

### Reset Database (⚠️ WARNING: Deletes all data)
```bash
npx prisma migrate reset
```

## 🔧 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## 📦 Dependencies

### Production
- `express` - Web framework
- `@prisma/client` - Prisma ORM client
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `multer` - File upload handling
- `express-validator` - Request validation
- `helmet` - Security headers
- `morgan` - HTTP logger

### Development
- `nodemon` - Auto-reload development server
- `prisma` - Prisma CLI

## 🔒 Security Notes

- Always use environment variables for sensitive data
- Never commit `.env` file to version control
- Use HTTPS in production
- Implement authentication/authorization as needed
- Validate and sanitize all user inputs
- Set appropriate file upload limits

## 📄 License

ISC

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

**Happy Coding! 🎉**

