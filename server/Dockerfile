FROM lafyun/app-service:latest

RUN npm i typescript @polkadot/api @polkadot/keyring @polkadot/util-crypto --registry=https://registry.npm.taobao.org --no-audit --no-fund

COPY ./init.js /app/dist/init.js
COPY ./functions /app/dist/functions