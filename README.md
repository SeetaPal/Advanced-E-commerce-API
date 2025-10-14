
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
API Endpoints
Authentication
•	POST /auth/register → Register a user
•	POST /auth/login → Login & get JWT
Products
•	POST /products → Add product (Admin only)
•	PUT /products/:id → Update product (Admin only)
•	DELETE /products/:id → Delete product (Admin only)
•	GET /products → List products with pagination, sorting, filtering
Cart
•	GET /cart → View user cart
•	POST /cart/items → Add/update item
•	DELETE /cart/items/:productId → Remove item
Orders
•	POST /orders/checkout → Create order & reserve stock
•	POST /orders/:id/pay → Mock payment simulation
•	GET /orders → User order history
•	GET /orders/:id → Single order details
Admin
•	GET /admin/orders → List all orders (filterable, paginated)
•	PATCH /admin/orders/:id/status → Update order status (SHIPPED / DELIVERED)

Background Workers 
•	emailWorker.js → Sends confirmation emails after successful payment
•	expiryWorker.js → Cancels unpaid orders automatically after 15 minutes
