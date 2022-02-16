FROM lafyun/app-service:0.7.10

RUN npm i typescript @polkadot/api @polkadot/keyring @polkadot/util-crypto

COPY ./init.js /app/dist/init.js
COPY ./functions /app/dist/functions