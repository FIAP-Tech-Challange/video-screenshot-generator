FROM alpine:3.19

RUN apk add --no-cache wget ca-certificates && \
  wget -q "https://dl.min.io/client/mc/release/linux-amd64/mc" -O /usr/local/bin/mc && \
  chmod +x /usr/local/bin/mc && \
  apk del wget

COPY init.sh /init.sh
RUN sed -i 's/\r$$//' /init.sh && chmod +x /init.sh

CMD ["/init.sh"]
