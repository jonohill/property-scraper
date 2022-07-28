FROM --platform=$BUILDPLATFORM node:16 AS build

WORKDIR /usr/src/app

COPY . .

ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci && npm run build

FROM node:16 AS deps

WORKDIR /usr/src/app

COPY . .

RUN npm ci --omit=dev

FROM node:16-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \ 
    fonts-liberation \
    gconf-service \
    libappindicator1 \
    libasound2 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libfontconfig1 \
    libgbm-dev \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libicu-dev \
    libjpeg-dev \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpng-dev \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./package.json
COPY --from=build /usr/src/app/dist ./dist
COPY --from=deps /usr/src/app/node_modules ./node_modules

ENV PORT=3000
ENV READINESS_CHECK_PATH=/ok
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.3.3 /lambda-adapter /opt/extensions/lambda-adapter    

ENTRYPOINT [ "npm", "run", "start" ]
