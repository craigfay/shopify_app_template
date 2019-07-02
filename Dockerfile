FROM node:9

WORKDIR /usr/src/app

COPY package.json .

COPY . .

CMD npm install

EXPOSE 3000
