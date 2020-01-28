FROM nginx

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/dev-server.conf /etc/nginx/conf.d/
COPY nginx/includes/* /etc/nginx/includes/

CMD ["nginx", "-g", "daemon off;"]
