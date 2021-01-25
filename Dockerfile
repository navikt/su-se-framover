FROM navikt/node-express:12.2.0-alpine

ENV NODE_ENV production
ENV BASE_DIR /app
ENV FRONTEND_DIR ${BASE_DIR}/frontend
ENV BACKEND_DIR ${BASE_DIR}/server
ENV PORT 80

RUN mkdir -p ${BASE_DIR}

COPY dist ${FRONTEND_DIR}
COPY server ${BACKEND_DIR}
# Trengs av server-bygget
COPY tsconfig.json ${BASE_DIR}/

WORKDIR ${BACKEND_DIR}
RUN npm ci
RUN npm run build

EXPOSE ${PORT}

CMD ["NODE_ENV=production npm", "start"]
