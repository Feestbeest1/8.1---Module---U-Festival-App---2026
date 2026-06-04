# Stage 1: build de React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY files/u-festival-app/u-festival-app/package*.json ./
RUN npm ci
COPY files/u-festival-app/u-festival-app/ ./
RUN npm run build

# Stage 2: serveer via nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY files/u-festival-app/u-festival-app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
