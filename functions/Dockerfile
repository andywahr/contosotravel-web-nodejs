FROM node:10-alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN if [ "$eventing" == "servicebus"]; \
    then export CTSTARTUP=serviceServiceBus; \
    else export CTSTARTUP=serviceHttp; \
    fi
ENV PORT 80
CMD node app.js ${CTSTARTUP}
EXPOSE 80