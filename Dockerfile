FROM navikt/node-express:14-alpine

ENV NODE_ENV production
ENV BASE_DIR /app
ENV FRONTEND_DIR ${BASE_DIR}/frontend
ENV BACKEND_DIR ${BASE_DIR}/server
ENV PORT 8080

USER root

COPY dist ${FRONTEND_DIR}
COPY server ${BACKEND_DIR}
# Trengs av server-bygget
COPY tsconfig.json ${BASE_DIR}/

WORKDIR ${BACKEND_DIR}
RUN npm ci
RUN npm run build

EXPOSE ${PORT}

USER apprunner

CMD ["npm", "start"]
