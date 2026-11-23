# Node.js 24.22.3
FROM gcr.io/distroless/nodejs24-debian13:nonroot@sha256:39b0407357c9fadf1a9708d22088f02de21f0e1e8a688474eea2d8701e7d5693

ENV NODE_ENV=production
ENV PORT=8080
ENV FRONTEND_DIR=/app/frontend

COPY dist ${FRONTEND_DIR}
COPY server/dist /app/server
COPY server/package.json /app/server/package.json
COPY server/node_modules /app/server/node_modules

WORKDIR /app/server

EXPOSE ${PORT}

CMD ["index.js"]
