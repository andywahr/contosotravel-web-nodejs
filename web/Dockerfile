FROM node:10-alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
ENV PORT 80
CMD node app.js web
EXPOSE 80