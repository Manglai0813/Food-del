
# Food-Del: Full-Stack Food Delivery Platform

## 1. Project Overview

Food-Del is a comprehensive full-stack food delivery web application. It features a customer-facing frontend for browsing and ordering food, a powerful backend API to handle business logic, and a dedicated admin dashboard for managing the platform's content. The entire project is containerized using Docker for streamlined development and deployment.

## 2. Project Structure

The project is organized into a monorepo containing three distinct services:

-   `food-del-client/`: The customer-facing web application.
-   `food-del-server/`: The backend API server.
-   `food-del-dashboard/`: The admin management dashboard.

## 3. Technology Stack

| Category      | Technologies Used                                                                                             |
| :------------ | :------------------------------------------------------------------------------------------------------------ |
| **Frontend**  | React (v18), Vite, React Router (v7), Axios                                                                   |
| **Backend**   | Bun, Node.js, Express.js, TypeScript, Prisma (ORM)                                                            |
| **Database**  | PostgreSQL                                                                                                    |
| **Admin UI**  | Next.js (v15, with Turbopack), React (v19), Tailwind CSS, Shadcn/UI                                            |
| **DevOps**    | Docker, Docker Compose                                                                                        |

## 4. Features & API Endpoints

### 4.1. User Authentication

Handles user registration and login functionality.

-   **`POST /api/user/auth/register`**
    -   Description: Registers a new user account.
    -   Request Body: `name`, `email`, `password`
-   **`POST /api/user/auth/login`**
    -   Description: Authenticates a user and returns a session token.
    -   Request Body: `email`, `password`
-   **`POST /api/user/auth/logout`**
    -   Description: Logs out the currently authenticated user.

### 4.2. Food Management (Admin-Protected)

Provides administrators with endpoints to manage food items. All these routes require admin authentication.

-   **`POST /api/food`**
    -   Description: Adds a new food item to the menu.
    -   Payload: `multipart/form-data` including food details and an image.
-   **`PUT /api/food/:id`**
    -   Description: Updates an existing food item.
    -   Payload: `multipart/form-data` including updated details and an optional new image.
-   **`DELETE /api/food/:id`**
    -   Description: Removes a food item from the menu.

### 4.3. Public Menu Access

Allows all users to view food items.

-   **`GET /api/food`**
    -   Description: Retrieves a list of all available food items.
-   **`GET /api/food/:id`**
    -   Description: Fetches details for a single food item by its ID.

## 5. How to Run the Project

The entire application stack can be launched using Docker Compose.

1.  **Prerequisites**:
    *   Docker and Docker Compose must be installed on your system.

2.  **Environment Setup**:
    *   Ensure the `.env` files in the `food-del-server` and `food-del-client` directories are correctly configured with your database credentials and API URLs.

3.  **Build and Run**:
    *   Navigate to the project root directory and run the following command:
        ```bash
        docker-compose up --build
        ```

4.  **Accessing the Services**:
    *   **Client App**: `http://localhost:5173`
    *   **Admin Dashboard**: `http://localhost:3001`
    *   **Backend API**: `http://localhost:5000`

## 6. Creating an Admin User

To manage the application's content, an admin user is required. Follow these steps to create one:

1.  **Register a Standard User**:
    *   Use the client application or the admin dashboard's registration interface to create a new user account with a secure password.

2.  **Connect to the Database**:
    *   Access the PostgreSQL database directly. You can use a command-line tool like `psql` or a GUI tool like DBeaver or pgAdmin.
    *   If using Docker, you can connect to the containerized database with the following command:
        ```bash
        docker-compose exec -u postgres postgres psql -d fooddb
        ```

3.  **Update User Role**:
    *   Once connected, run the following SQL command to update the user's role to `admin`. Replace `'user-email@example.com'` with the email of the user you just registered.
        ```sql
        UPDATE users SET role = 'admin' WHERE email = 'user-email@example.com';
        ```

4.  **Verification**:
    *   The user with this email address now has admin privileges and can access the protected routes in the admin dashboard.


