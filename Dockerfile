FROM gcr.io/distroless/nodejs:18

ENV NODE_ENV production

RUN echo $(pwd)
RUN echo $(ls -altr)
COPY dist /app/frontend
COPY server/dist /app/server
COPY server/node_modules /app/server/node_modules

WORKDIR /app/server

EXPOSE 8080

CMD ["index.js"]
