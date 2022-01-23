FROM nginx:latest
ADD dist /app
ADD nginx.conf /etc/nginx/conf.d/nginx.conf
EXPOSE 80