FROM node:10-alpine
ARG eventing
WORKDIR /app 
COPY package.json /app
RUN npm install
COPY . /app
ENV PORT 80
ENV eventing=$eventing
CMD ["sh", "-c", "node /app/app.js $eventing"]
EXPOSE 80