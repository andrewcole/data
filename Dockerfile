# Use the official Nodejs image as the base
FROM docker.io/library/node:21.7.3 AS base

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json .
COPY tsconfig.json .

# Install dependencies
RUN npm i

# Build the data
FROM base AS data

# Copy all project files
COPY data src

# Generate data
RUN npm run build && npm run start

# Build the application
FROM base AS build

# Copy all project files
COPY src src

# Build the application
RUN \
  npm run build \
    && \
  npm run schema \
    && \
  npm run static

# Final image
FROM base AS final

# Install dumb-init
RUN \
    wget -q -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 \
  && \
    chmod +x /usr/local/bin/dumb-init

# Install data
COPY --from=data /app/dist /app/dist

# Install application
COPY --from=build /app/dist /app/dist

# Specify the port the container will listen on
EXPOSE 4000
# 
# Use dumb-init as the entrypoint
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Set the command to start the application
CMD ["npm", "start"]