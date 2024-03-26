FROM docker.io/library/node:latest

RUN \
    wget -q -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 \
  && \
    chmod +x /usr/local/bin/dumb-init

WORKDIR /data
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["node", "app.js"]

EXPOSE 39919

COPY package.json /data/package.json
RUN npm install

COPY app.js /data/app.js
COPY html/ /data/html/
COPY json/ /data/json/