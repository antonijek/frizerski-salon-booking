# ============================================
# Stage 1: Build React aplikaciju
# ============================================
FROM node:18-alpine AS build

WORKDIR /app

# Kopiraj package.json i package-lock.json
COPY package*.json ./

# Instaliraj sve dependencies (uključujući dev)
RUN npm ci

# Kopiraj ceo frontend kod
COPY . .

# Build aplikaciju
RUN npm run build

# ============================================
# Stage 2: Serviraj sa nginx-om
# ============================================
FROM nginx:alpine

# Kopiraj nginx konfiguraciju
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiraj build-ovane fajlove iz prvog stage-a
COPY --from=build /app/dist /usr/share/nginx/html

# Port na kome nginx sluša
EXPOSE 80

# Pokreni nginx u foreground modu
CMD ["nginx", "-g", "daemon off;"]
