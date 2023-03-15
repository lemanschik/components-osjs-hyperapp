

FROM node:latest
RUN npm install -g nodemon
WORKDIR /usr/src/OS.js
COPY entrypoint.sh .
CMD ./entrypoint.sh
