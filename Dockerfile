ROM mhart/alpine-node:6.11.3
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
COPY . /sysiphus

WORKDIR /sysiphus/frontend/
RUN npm install
RUN bower install --allow-root
RUN brunch build --production

WORKDIR /sysiphus/backend/
RUN npm install
ENTRYPOINT ["npm", "start"]
