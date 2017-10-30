FROM node

MAINTAINER oscar-rreyes1@hotmail.com

RUN npm install pm2 -g && yarn global add yarn

WORKDIR /usr/src/app

COPY . .

CMD ["npm", "start"]