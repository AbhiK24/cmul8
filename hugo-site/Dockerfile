# Build stage
FROM hugomods/hugo:exts as builder

WORKDIR /src
COPY . .

RUN hugo --minify

# Production stage
FROM nginx:alpine

COPY --from=builder /src/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf.template

# Default port for Railway
ENV PORT=8080

EXPOSE 8080

# Use envsubst to replace $PORT at runtime
CMD envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'
