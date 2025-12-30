# TCOMS - Tech Companies ERP

## Setup

1.  **Backend**:
    ```bash
    cd backend
    npm install
    cp .env.example .env # Ensure DATABASE_URL is set
    npx prisma migrate dev
    npm run dev
    ```

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  **Database**:
    ```bash
    docker-compose up -d
    ```

## API Documentation

The key endpoints are structured as:
- `/api/auth`: Login/Register
- `/api/company`: Departments/Positions
- `/api/employees`: Profile management
- `/api/attendance`: Punch in/out
- `/api/hr`: Leave & Compensation
- `/api/recruitment`: Jobs, Applicants, Interviews
- `/api/pm`: Projects, Tasks

## Deployment

Use Docker to deploy:
1. Build backend image.
2. Build frontend image (or serve via Nginx).
3. Use `docker-compose.prod.yml` (to be created) for orchestration.
