FROM gcr.io/distroless/nodejs:18

ENV NODE_ENV production

WORKDIR /app/server

COPY dist /app/frontend
COPY server/dist /app/server
COPY server/node_modules /app/server/node_modules

EXPOSE 8080

CMD ["index.js"]
