FROM nginx

COPY nginx.conf /etc/nginx/conf.d/nais.conf
COPY dist/* /usr/share/nginx/html/

COPY config.template.json /usr/share/nginx/html/config.template.json

COPY docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
