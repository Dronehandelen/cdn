FROM node:14 as prod
WORKDIR /app
COPY . .
RUN yarn install
EXPOSE 80
CMD [ "node", "src/api.js" ]

FROM prod as dev
RUN yarn global add nodemon
CMD yarn; yarn migrate; yarn start:dev