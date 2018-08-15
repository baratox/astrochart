FROM node:9.1

RUN npm install -g bower grunt-cli
RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# Add NodeJs tools to path
ENV PATH "$PATH:./node_modules/.bin"

# Change the UID and GID of the "node" user to match host's user. This way, new
# files created inside the container will have the correct ownership in the host.
ARG UID
ARG GID
RUN usermod -u $UID node
RUN groupmod -g $GID node
RUN usermod -g $GID node

USER node
WORKDIR /home/node/
