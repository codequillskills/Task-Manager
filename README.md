# Task Manager

A web application for managing tasks with secure authentication and role-based access control.

## Live Demo

You can access the live application [HERE](https://taskmanager-codequillskills.vercel.app)

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Authentication**:
  - Secure JWT-based authentication
  - Session timeout after 1 hour of inactivity
  - Protected API routes

- **Task Management**:
  - Create, read, update and delete tasks
  - Sort and filter tasks
  - Search functionality
  
- **User Experience**:
  - Responsive design
  - Toast notifications
  - Clean and intuitive interface

## Requirements

- Node.js
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/codequillskills/Task-Manager.git
   ```
2. Navigate to project directory:
   ```bash
   cd Task-Manager
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with required environment variables like in .env.example.
5. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Login with your credentials
3. Start managing your tasks with the intuitive interface

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.