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
RUN yarn install --frozen-lockfile

# Copy everything else
COPY . .

# Start the app
CMD yarn start