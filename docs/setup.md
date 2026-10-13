# Setup Guide

Follow these steps to get the project running locally.

## Prerequisites
- Node.js 18+
- A MongoDB Atlas account (or a local MongoDB instance)

## Installation
1. Clone the repository.
2. Run `npm run setup` from the project root to install dependencies for both the client and server.

## Configuration
1. Navigate to the `server` directory.
2. Copy `.env.example` to `.env`.
3. Update `MONGODB_URI` in `server/.env` with your MongoDB connection string.

## Running the Application
1. From the project root, run `npm run dev`.
2. The API will be available at `http://localhost:5000`.
3. The frontend will be available at `http://localhost:5173`.
