FROM node:12-buster as builder

RUN mkdir -p /app
WORKDIR /app

COPY ./src/ /app/src/
COPY ./public/ /app/public/
COPY ./config/ /app/config/
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
COPY ./tsconfig.json /app/tsconfig.json
COPY ./tsconfig.build.json /app/tsconfig.build.json

RUN yarn
# RUN yarn add puppeteer@chrome-73

RUN yarn run build
# ---------- END BUILDER STAGE ----------


FROM node:12-buster

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update && apt-get install -y wget gnupg gnupg2 gnupg1
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxtst6 libxss1 \
      --no-install-recommends \
    && apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget \
    && rm -rf /var/lib/apt/lists/*


RUN mkdir -p /app

# Add user so we don't need --no-sandbox.
RUN groupadd -r appuser && useradd -r -g appuser -G audio,video appuser \
    && mkdir -p /home/appuser/Downloads \
    && chown -R appuser:appuser /home/appuser \
    && chown -R appuser:appuser /app

# Run everything after as non-privileged user.
USER appuser

WORKDIR /app

COPY --from=builder /app/node_modules/ /app/node_modules/
COPY --from=builder /app/dist/ /app/dist/
COPY --from=builder /app/public/ /app/public/
COPY --from=builder /app/config/ /app/config/
COPY --from=builder /app/package.json /app/

RUN mkdir -p /app/sessions/

ENV TYPEORM_ENTITIES "dist/entities/*.js"
ENV TYPEORM_MIGRATIONS "dist/migrations/*.js"
ENV TYPEORM_MIGRATIONS_RUN true
ENV TYPEORM_SYNCHRONIZE FALSE
ENV PORT 8080
EXPOSE 8080

ENTRYPOINT ["yarn", "start", "--cache-folder", "/tmp"]
