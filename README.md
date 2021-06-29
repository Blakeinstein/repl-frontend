# repl-frontend

This is a proof-of-concept implementation of writing a repl.it clone. This contains two parts.
1. Frontend -> Vite (vanilla-ts) 
2. Backend -> Fastify

To get up and running. 

## Prequisites
1. npm
2. docker

## Backend

1. cd to backend directory 
  ```bash
  cd backend
  ```
2. Build docker image
  ```bash
  docker build -t repl-backend .
  ```
3. Once the image is built. 
  ```bash
   docker run -dp 3030:3030 repl-backend
  ```
  
# Frontend

1. cd to frontend directory
  ```bash
  cd frontend
  ```
  
2. Install node dependencies
  ```bash
  npm i
  ```

3. Run development build
  ```bash
  npm run dev
  ```
