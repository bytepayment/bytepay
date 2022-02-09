FROM nginx:latest
ADD dist /app
ADD nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80