## Backend Maity Pro
This is a Node.js-based project built with TypeScript. It includes a REST API specification, Docker setup, and configuration for CI/CD workflows.

Project Structure 
The project structure is as follows:

```bash
.
├── .github/
├── node_modules/
├── src/
├── .env
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── openapi.yaml
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json   


```

## Getting Started
To get started, follow these steps:

1. Clone the repository:
```bash
git clone https://github.com/your-username/your-project.git
```
2. Navigate to the project directory:
```bash
cd your-project
```
3. Install the dependencies:
```bash
npm install
```
4. Create a .env file and add your environment variables:
```bash
touch .env
```
5. Configure your environment variables in the .env file:
```bash
PORT=8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=XXX
COMPANY_RESEND_GMAIL_ACCOUNT=XXX
STRIPE_SECRET_KEY=XXX
STRIPE_WEBHOOK_SECRET=XXX
STRIPE_PRICE_FREE=XXX
STRIPE_PRICE_INTRO=XXX
STRIPE_YEARLY_PRICE_INTRO=XXX
STRIPE_PRICE_PRO=XXX
STRIPE_YEARLY_PRICE_PRO=XXX
STRIPE_FRONTEND_SUCCESS_CALLBACK=XXX
STRIPE_FRONTEND_CANCEL_CALLBACK=XXX
AUTH_SECRET=XXX
JWT_SALT=XXX
FLASK_BACKEND_ML_URL=XXX
AWS_ACCESS_KEY_ID=XXX
AWS_REGION=XXX
AWS_SECRET_ACCESS_KEY=XXX
AWS_BUCKET_NAME=XXX
```
6. Start the development server:
```bash 
npm run dev
```
7. Open your browser and navigate to http://localhost:8000 to access the application.


## Documentation of the project
```bash

├──src/
│   ├──── configF/
│   │       ├── s3.ts  -->  Configuration for AWS S3 Bucket storage
│   │       ├── stripe.ts -->  Configuration for Stripe payments
│   │       ├── db.ts -->  Configuration for MongoDB database
│   │       ├── multer.ts   -->  Configuration for temporary file uploads
│   ├
│   ├──── controllers/
│   │       ├── admin/
|   |       |      ├── admin.ts  -->  Controllers for admin-only routes
|   |       |      ├── avatar.ts -->  Controllers for avatar-related routes
|   |       |      
│   │       ├── landing/
|   |       |      ├── landing.ts  -->  Controllers for landing page
|   |       |     
│   │       ├── notifications/
|   |       |      ├── notifications.ts  -->  Controllers for notifications
|   |       |
│   │       ├── users/
|   |       |      ├── users.ts  -->  Controllers for user-related routes
|   |       |
│   │       ├── plans/
|   |       |      ├── plans.ts  -->  Controllers for plan-related routes
|   |       |
│   │       ├── projects/
|   |       |      ├── projects.ts  -->  Controllers for project-related routes
|   |       
│   │      
│   │      
│   ├──── lib/
│   │       ├── constant.ts
│   │       ├── errors/
│   │              ├── error-response-handler.ts  -->  Error handling middleware
│   │
│   │
│   ├──── middlewares/
│   │       ├── auth.ts  -->  Middleware for authentication
│   │       
|   |
│   ├──── models/
│   │       ├── admin/
│   │       ├      ├── admin-schema.ts  -->  Admin-only models
│   │       ├      ├── avatar-schema.ts -->  Avatar-related models
│   │       ├      ├── income-schema.ts -->  Income-related models
│   │       ├      ├── notification-schema.ts -->  Notification-related models
│   │       ├
│   │       ├── user/
│   │       ├      ├── user-schema.ts  -->  User-related models
│   │       ├      ├── project-schema.ts -->  Project-related models
│   │       ├     
│   │       ├── idempotency-schema.ts  -->  Idempotency key model to prevent duplicate payments stripe duplicate webhooks events
│   │       ├── password-token-schema.ts  -->  Password token model for password reset otp's
│   │       ├── subscribed-email-schema.ts  -->  Subscribed email model for sending newsletters emails
│   │
│   ├──── routes/
│   │       ├── admin.ts  -->  Routes for admin-only routes
│   │       ├── index.ts  -->  Routes definitions 
│   │       ├── user.ts -->  Routes for user-related routes
│   │       └── landing.ts -->  Routes for landing page
│   │
│   ├──── utils/
│   │       ├── index.ts  -->  Utility functions of db and FLASK backend calls
│   │       ├── mails/
│   │              ├── mail.ts  -->  Send email functions
│   │              ├── token.ts -->  Token generated functions
│   │              ├── templates/
│   │                      ├── forgot-password-reset.ts -->  Forgot password reset email 
│   │
│   ├────  services/
│   │       ├── admin/
│   │       ├      ├── admin-service.ts  -->  Admin-only services
│   │       ├      ├── avatar.ts -->  Avatar-related services
│   │       ├
│   │       ├── landing/
│   │       ├      ├── landing-service.ts  -->  Landing page services
│   │       ├
│   │       ├── notifications/
│   │       ├      ├── notifications.ts  -->  Notifications-related services
│   │       ├
│   │       ├── plans/
│   │       ├      ├── plans.ts  -->  Plans-related services
│   │       
│   │       ├── projects/
│   │       ├      ├── projects.ts  -->  Projects-related services
│   │       ├── users/
│   │       ├      ├── users.ts  -->  Users-related services
│   │
│   │
│   ├──── uploads/
│   │       ├── temp.png(X) -->  Temporary image for uploads
│   │
│   ├────  validation/
│   │       ├── client-user.ts  -->  Validation for client user requests
│   │       ├── admin-user.ts -->  Validation for admin user requests
│   │       ├── format-zod-errors.ts  -->  Format Zod errors
│   │       ├── payment.ts  -->  Validation for payment requests
│   │      
│   └──    app.ts -->  Backend app initialization and configuration (ENTRY POINT)
│   
├── .env
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── openapi.yaml
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json   
``` 
