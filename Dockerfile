FROM node:alpine

# Create app directory
WORKDIR /usr/src/pdns-auth-proxy

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080

ENTRYPOINT ["node"]
CMD ["proxy.js"]
