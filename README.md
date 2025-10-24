
# Advanced E-Commerce API
A robust, production-ready E-commerce backend built with **Node.js**, **Express**, and **MongoDB**, featuring **JWT authentication**, **role-based access**, **complex order state management**, **inventory reservation**, and **asynchronous background processing**.



## Features
- **Authentication & Authorization**: JWT-based authentication and role-based access control (User/Admin).  
- **Product Management**: CRUD operations for products (Admin only).  
- **Cart Management**: Add, update, and remove items.  
- **Order Management**:  
  - Checkout with **atomic stock reservation**  
  - Mock payment simulation  
  - Automatic order cancellation for unpaid orders  
  - Order lifecycle: `PENDING_PAYMENT → PAID → SHIPPED → DELIVERED → CANCELLED`  
- **Inventory Reservation**: Prevents race conditions during checkout.  
- **Pagination, Sorting, Filtering**: For product and order listing endpoints.  
- **Asynchronous Processing**: Email confirmation jobs, order expiry jobs.  
- **Error Handling**: Centralized error middleware with meaningful messages.  


## Tech Stack
- **Node.js** & **Express.js**  
- **MongoDB** & **Mongoose**  
- **JWT Authentication**  
- **dotenv** for environment variables  
- **Validation**: Joi  
- **Background Jobs**: Node workers (`setInterval` / custom logic)  
- **Dev Tools**: Nodemon, Morgan, Helmet, CORS  

---

## Getting Started

### 1. Clone the repository
```bash
git clone <your-github-url>
cd ecommerce-api
2. Install dependencies
npm install
3. Setup environment variables
Create a .env file in the root:
PORT=4000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
4. Start the server
npm run dev
Server runs at: http://localhost:4000
________________________________________
🛍️ E-Commerce REST API

A complete RESTful API for an e-commerce platform built with Node.js, Express, and MongoDB.
Supports User Authentication, Admin Role Management, Product Management, Cart, and Order Handling.

🚀 Base URL
http://localhost:4000

🔐 Authentication APIs
➕ Register User

Endpoint: POST /auth/register
Body:

{
  "name": "Seeta Pal",
  "email": "seetapal875@gmail.com",
  "password": "123456"
}

🛡️ Register Admin

Endpoint: POST /auth/register
Body:

{
  "name": "Seeta Pal",
  "email": "seetaofficial25@gmail.com",
  "password": "123456",
  "role": "ADMIN"
}

🔐 Admin Login

Endpoint: POST /auth/login
Body:

{
  "email": "seetaofficial25@gmail.com",
  "password": "123456"
}

👩‍💻 User Login

Endpoint: POST /auth/login
Body:

{
  "email": "seetapal875@gmail.com",
  "password": "123456"
}

🔑 JWT Tokens
Admin Token
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmI0ZjJkYzI3YjQ5Y2ZiMTYzMjlhOSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2MTMwMDMxMiwiZXhwIjoxNzYxOTA1MTEyfQ.5If3m0wbr2gY9AyZKJrnFZYlH1s7G-IwCmn9e4MJUEw

User Token
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmI0ZjIwYzI3YjQ5Y2ZiMTYzMjlhNiIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzYxMzAwMjk5LCJleHAiOjE3NjE5MDUwOTl9.2icX6Fe4ftfhgYWQhBB2h6bnylm4kia86aTjgKwTR5Y

🛍️ Product APIs
➕ Add Product (Admin Only)

Endpoint: POST /products
Headers:

Authorization: Bearer <Admin_Token>


Body:

{
  "name": "Awesome Widget",
  "price": 250,
  "description": "Test widget",
  "totalStock": 10
}

🔎 Get Products

Endpoint: GET /products?name=Awesome Widget

✏️ Update Product

Endpoint: PUT /products/:id
Example:

PUT /products/68fb5df80fe9297b1d9a69cc


Body:

{
  "price": 200
}

❌ Delete Product

Endpoint: DELETE /products/:id
Example:

DELETE /products/68fb5f800fe9297b1d9a69db

🛒 Cart APIs
➕ Add to Cart

Endpoint: POST /cart/items
Headers:

Authorization: Bearer <User_Token>


Body:

{
  "productId": "68fb54cfc27b49cfb1632a00",
  "quantity": 2
}

🧾 Get Cart

Endpoint: GET /cart
Headers:

Authorization: Bearer <User_Token>

🗑️ Remove Item from Cart

Endpoint: DELETE /cart/items/:productId
Example:

DELETE /cart/items/68fb5df80fe9297b1d9a69cc

📦 Order APIs
🧾 Checkout Order

Endpoint: POST /orders/checkout
Headers:

Authorization: Bearer <User_Token>


Body:

{
  "paymentMethod": "online"
}

📜 Order History

Endpoint: GET /orders
Headers:

Authorization: Bearer <User_Token>

💳 Pay for Order

Endpoint: POST /orders/:id/pay
Example:

POST /orders/68fb620b0fe9297b1d9a6a0b/pay


Body:

{
  "succeed": true
}

⚙️ Admin Order Management
🚫 Update Order Status

Endpoint: PUT /admin/orders/:id/status
Example:

PUT /admin/orders/68ee9ad4ffff8b9b745ffa17/status


Headers:

Authorization: Bearer <Admin_Token>


Body:

{
  "status": "CANCELLED"
}

📊 View All Admin Details

Endpoint: GET /
Description: Returns admin overview or server status check.

🧠 Notes


Tokens are passed in headers as:

Authorization: Bearer <token>


JSON request bodies must include correct field names and types.
→ Sends confirmation emails after successful payment
•	expiryWorker.js → Cancels unpaid orders automatically after 15 minutes
