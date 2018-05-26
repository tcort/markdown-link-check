FROM node:latest
LABEL maintainer="https://github.com/4x0v7"

# Install app dependencies
COPY package.json /src/package.json
WORKDIR /src
RUN set -ex; \
    npm install \
    && npm ls
# Bundle app source
COPY . /src
RUN npm test
ENTRYPOINT [ "/src/markdown-link-check" ]
