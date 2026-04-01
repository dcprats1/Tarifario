FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY .npmrc ./.npmrc
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm install --workspaces --include-workspace-root || true
COPY . .
EXPOSE 3001 5173
CMD ["npm", "run", "dev"]
