# SniperThink FullStack Assignment

A production-ready full stack application featuring an interactive strategy flow frontend with React and a robust Node.js backend with file processing capabilities.

## 🚀 Features

### Frontend (React + Vite)
- **Interactive Strategy Flow**: 4 animated strategy steps with scroll-based storytelling
- **Framer Motion Animations**: Smooth viewport animations and interactions
- **Dynamic Content**: Strategy steps rendered from data files
- **Interest Form**: Functional form with validation and API integration
- **Responsive Design**: Modern UI with TailwindCSS-inspired styling
- **Real-time Progress**: Visual progress indicators and scroll-based updates

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations for all resources
- **File Upload System**: PDF and TXT file processing with Multer
- **Queue Management**: BullMQ with Redis for asynchronous job processing
- **Database Integration**: MySQL with proper models and relationships
- **Text Analysis**: Keyword extraction, readability scoring, and content analysis
- **Error Handling**: Comprehensive error middleware and logging
- **Security**: Helmet, CORS, rate limiting, and input validation

## 📁 Project Structure

```
sniperthink-fullstack-assignment/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/        # Reusable components
│   │   │   └── strategy/      # Strategy-specific components
│   │   ├── data/              # Static data files
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── styles/            # Global styles
│   │   └── utils/             # Utility functions
│   ├── .env
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js backend
│   ├── config/                # Database and Redis configuration
│   ├── controllers/           # API controllers
│   ├── middlewares/           # Custom middlewares
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── services/              # Business logic services
│   ├── utils/                 # Utility functions
│   ├── workers/               # Queue workers
│   ├── uploads/               # File upload directory
│   ├── .env
│   ├── app.js
│   ├── server.js
│   └── package.json
├── shared/                     # Shared constants
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Framer Motion** - Animation library
- **Axios** - HTTP client for API requests
- **CSS3** - Modern CSS with animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **Redis** - In-memory data store
- **BullMQ** - Queue management system
- **Multer** - File upload handling
- **PDF-parse** - PDF text extraction
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v8 or higher)
- **Redis** (v6 or higher)
- **npm** or **yarn**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sniperthink-fullstack-assignment
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE sniperthink_db;
```

### 3. Environment Configuration

#### Backend Environment
Create `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sniperthink_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

#### Frontend Environment
Create `client/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Environment
VITE_NODE_ENV=development
```

### 4. Install Dependencies

#### Backend Dependencies
```bash
cd server
npm install
```

#### Frontend Dependencies
```bash
cd ../client
npm install
```

### 5. Start the Applications

#### Start Backend Server
```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

#### Start Frontend Development Server
```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📖 API Documentation

### Base URL
`http://localhost:5000/api`

### Endpoints

#### Interest Management
- `POST /api/interest` - Submit interest form
- `GET /api/interest` - Get all interest submissions (admin)
- `GET /api/interest/stats` - Get interest statistics (admin)

#### File Upload
- `POST /api/upload` - Upload file for processing
- `GET /api/upload/status/:jobId` - Get upload status
- `GET /api/uploads` - Get user uploads
- `DELETE /api/upload/:fileId` - Delete uploaded file

#### Job Management
- `GET /api/job/:jobId` - Get job status
- `GET /api/jobs` - Get all jobs (admin)
- `GET /api/jobs/stats` - Get job statistics (admin)
- `POST /api/job/:jobId/cancel` - Cancel job (admin)
- `POST /api/job/:jobId/retry` - Retry failed job (admin)

#### Results
- `GET /api/result/:jobId` - Get job result

#### Health Check
- `GET /health` - Server health status

### API Documentation
Visit `http://localhost:5000/api` for interactive API documentation.

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Files Table
```sql
CREATE TABLE files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  file_path VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  progress INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);
```

### Results Table
```sql
CREATE TABLE results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT UNIQUE,
  word_count INT DEFAULT 0,
  paragraph_count INT DEFAULT 0,
  keywords JSON,
  processing_time INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
```

## 🔄 Queue System

The application uses BullMQ for asynchronous file processing:

### Job Types
- **file-processing**: Process uploaded files and extract text

### Job States
- **pending**: Waiting to be processed
- **processing**: Currently being processed
- **completed**: Processing finished successfully
- **failed**: Processing failed

### Worker Configuration
- **Concurrency**: 3 files processed simultaneously
- **Retry Attempts**: 3 automatic retries on failure
- **Backoff**: Exponential delay between retries

## 📁 File Processing

### Supported File Types
- **PDF** (`.pdf`) - Text extraction using pdf-parse
- **Text** (`.txt`) - Direct text reading

### Processing Steps
1. **File Validation**: Check file type and size
2. **Text Extraction**: Extract text from file
3. **Text Analysis**: 
   - Word count
   - Paragraph count
   - Keyword extraction (top 10)
   - Readability scoring
4. **Result Storage**: Save analysis results to database

### File Size Limits
- **Maximum Size**: 10MB per file
- **Rate Limiting**: 10 uploads per hour per IP

## 🎨 Frontend Features

### Strategy Flow Animation
- **Scroll-triggered animations**: Steps animate when entering viewport
- **Progress indicators**: Visual progress bar and step indicators
- **Interactive cards**: Clickable strategy cards with hover effects
- **Smooth transitions**: Framer Motion animations throughout

### Form Features
- **Real-time validation**: Email and name validation
- **Loading states**: Visual feedback during submission
- **Error handling**: User-friendly error messages
- **Success feedback**: Confirmation messages on successful submission

### Responsive Design
- **Mobile-first approach**: Optimized for all screen sizes
- **Touch-friendly**: Interactive elements work on touch devices
- **Performance optimized**: Lazy loading and efficient animations

## 🛡️ Security Features

### Backend Security
- **Helmet**: Security headers and XSS protection
- **CORS**: Proper cross-origin resource sharing
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all inputs
- **File Upload Security**: Type and size validation

### Data Protection
- **Environment Variables**: Sensitive data in .env files
- **SQL Injection Prevention**: Parameterized queries
- **Error Handling**: No sensitive data in error responses

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests (when implemented)
cd client
npm test
```

### Test Coverage
- API endpoint testing
- Database model testing
- Component testing (planned)
- Integration testing (planned)

## 📊 Monitoring

### Health Check Endpoint
`GET /health` provides:
- Server status
- Database connection status
- Redis connection status
- Queue statistics
- Memory usage
- Uptime information

### Logging
- Request logging with response times
- Error logging with stack traces
- Queue operation logging
- Database query logging

## 🚀 Production Deployment

### Environment Variables
Set the following environment variables for production:

```env
NODE_ENV=production
PORT=5000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
CLIENT_URL=https://your-frontend-domain.com
```

### Database Setup
1. Create MySQL database
2. Run migrations (if implemented)
3. Set up proper indexes
4. Configure backup strategy

### Redis Setup
1. Install and configure Redis
2. Set up persistence
3. Configure memory limits
4. Set up monitoring

### Process Management
Use PM2 for production process management:

```bash
npm install -g pm2
pm2 start server/server.js --name sniperthink-api
pm2 startup
pm2 save
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Errors
- Check MySQL service is running
- Verify database credentials in .env
- Ensure database exists and user has permissions

#### Redis Connection Errors
- Check Redis service is running
- Verify Redis configuration in .env
- Check firewall settings

#### File Upload Issues
- Check uploads directory permissions
- Verify file size limits
- Check disk space

#### Frontend Build Issues
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify environment variables

### Getting Help

1. Check the logs for detailed error messages
2. Verify all prerequisites are installed
3. Ensure all environment variables are set correctly
4. Check that all services (MySQL, Redis) are running

## 📈 Performance Optimization

### Backend Optimization
- Database connection pooling
- Redis caching for frequent queries
- Queue-based processing for heavy tasks
- Compression middleware for responses

### Frontend Optimization
- Code splitting with Vite
- Lazy loading of components
- Optimized animations with Framer Motion
- Efficient state management

### Database Optimization
- Proper indexing on frequently queried columns
- Query optimization
- Connection pooling
- Regular maintenance

## 🔄 Version History

- **v1.0.0** - Initial release with full functionality
  - Interactive strategy flow
  - File upload and processing
  - Queue-based job processing
  - Complete API implementation
  - Database models and relationships

---

**Built with ❤️ using modern web technologies**
#   S n i p e r - T h i n k - F u l l - S t a c k  
 