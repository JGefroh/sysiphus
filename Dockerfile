FROM mhart/alpine-node:6.11.3
RUN apk add --no-cache \
    bash \
    curl \
    python=2.7.12-r0 \
    make \
    gcc \
    git \
    g++ \
    vim

RUN npm install -g bower
RUN npm install -g brunch

COPY ./frontend/package.json /sysiphus/frontend/package.json
WORKDIR /sysiphus/frontend/
RUN npm install

COPY ./frontend/bower.json /sysiphus/frontend/bower.json
WORKDIR /sysiphus/frontend/
RUN bower install --allow-root

COPY ./backend/package.json /sysiphus/backend/package.json
WORKDIR /sysiphus/backend/
RUN npm install

COPY . /sysiphus

WORKDIR /sysiphus/frontend/
RUN brunch build --production

WORKDIR /sysiphus/backend/
ENTRYPOINT ["npm", "start"]
