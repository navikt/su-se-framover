FROM navikt/node-express:16

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
# We need Python2/3 to install node-gyp: https://github.com/nodejs/docker-node/issues/384
RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python3 && \
    npm ci &&\
    apk del native-deps
RUN npm run build

EXPOSE ${PORT}

USER apprunner

CMD ["npm", "start"]
