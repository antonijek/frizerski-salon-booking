FROM node:18-alpine

WORKDIR /app

# Kopiraj package.json i package-lock.json
COPY package*.json ./

# Instaliraj dependencies (uključujući sharp koji zahteva build)
RUN npm ci --only=production

# Kopiraj ceo backend kod
COPY . .

# Kreiraj uploads folder (ako već ne postoji)
RUN mkdir -p uploads

# Port na kome backend sluša
EXPOSE 5000

# Pokreni server
CMD ["node", "server.js"]
