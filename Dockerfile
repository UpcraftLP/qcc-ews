FROM node:18-alpine

ENV NODE_ENV=production

ARG VERSION
ENV VERSION=${VERSION}

ARG COMMIT_SHA
ENV COMMIT_SHA=${COMMIT_SHA}

# Create app directory
WORKDIR /app

# Copy install files first to take advantage of caching
COPY package*.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

# Install app dependencies
RUN yarn install --frozen-lockfile --production=true

# Copy everything else
COPY . .

HEALTHCHECK --interval=30s --retries=3 --start-period=10s --timeout=10s \
	CMD yarn healthcheck

EXPOSE 8000

# Start the app
CMD yarn start
