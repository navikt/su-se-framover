FROM node:22.12.0-alpine

ENV NODE_ENV production
ENV PORT 8080
ENV FRONTEND_DIR /app/frontend

COPY dist ${FRONTEND_DIR}
COPY server/dist /app/server
COPY server/package.json /app/server/package.json
COPY server/node_modules /app/server/node_modules

WORKDIR /app/server

EXPOSE ${PORT}

CMD ["index.js"]

