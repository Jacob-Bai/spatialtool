FROM node:slim

# Create and define the node_modules's cache directory.
RUN mkdir /usr/src/cache
WORKDIR /usr/src/cache

# Install the application's dependencies into the node_modules's cache directory.
COPY package.json ./
COPY package-lock.json ./
RUN npm config set strict-ssl false
RUN npm install

RUN mkdir /tmp/app_uploads

# Create and define the application's working directory.
RUN mkdir /usr/src/app
WORKDIR /usr/src/app