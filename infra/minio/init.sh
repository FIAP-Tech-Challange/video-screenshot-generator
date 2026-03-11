#!/bin/sh

echo '--- MinIO init: connecting ---';

until mc alias set myminio ${MINIO_URL} $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD; do
  echo 'MinIO not ready. Retrying in 2s...';
  sleep 2;
done;

echo 'MinIO ready!';

echo '--- Configuring Kafka notification target ---';
mc admin config set myminio notify_kafka:meukafka \
  brokers="kafka:${KAFKA_INTERNAL_PORT}" \
  topic="${MINIO_KAFKA_TOPIC}";

echo '--- Restarting MinIO to apply Kafka config ---';
mc admin service restart myminio;
sleep 8;

echo '--- Reconnecting after restart ---';
until mc alias set myminio ${MINIO_URL} $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD; do
  echo 'MinIO restarting. Retrying in 2s...';
  sleep 2;
done;

echo '--- Creating buckets ---';
mc mb myminio/$BUCKET_VIDEO_NAME --ignore-existing;
echo "Bucket $BUCKET_VIDEO_NAME created.";
mc mb myminio/$BUCKET_SCREENSHOT_NAME --ignore-existing;
echo "Bucket $BUCKET_SCREENSHOT_NAME created.";

echo '--- Adding Kafka event to video bucket ---';
mc event add myminio/$BUCKET_VIDEO_NAME arn:minio:sqs::meukafka:kafka --event put --ignore-existing || true;

echo '--- MinIO init completed ---';
