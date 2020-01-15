FROM nginx

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/nais.conf
COPY nginx.app.conf /etc/nginx/conf.d/app.conf
COPY dist/* /app/www/

COPY config.template.json /app/www/config.template.json

COPY docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
