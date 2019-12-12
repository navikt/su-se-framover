FROM nginx

COPY nginx.conf /etc/nginx/conf.d/nais.conf
COPY dist/* /usr/share/nginx/html/