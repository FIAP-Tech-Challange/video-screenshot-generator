#!/bin/sh
# Defaults when env vars are not set (e.g. .env not loaded by docker-compose on Windows)
BUCKET_VIDEO_NAME="${BUCKET_VIDEO_NAME:-video}"
BUCKET_SCREENSHOT_NAME="${BUCKET_SCREENSHOT_NAME:-screenshot}"
MINIO_URL="${MINIO_URL:-http://minio:9000}"

echo '--- initializing config ---';

until mc alias set myminio "${MINIO_URL}" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"; do
  echo 'Minio not ready. Retrying in 2s...';
  sleep 2;
done;

echo 'Minio ready!';

mc mb "myminio/${BUCKET_VIDEO_NAME}" --ignore-existing;
echo "Bucket ${BUCKET_VIDEO_NAME} created.";
mc mb "myminio/${BUCKET_SCREENSHOT_NAME}" --ignore-existing;
echo "Bucket ${BUCKET_SCREENSHOT_NAME} created.";

mc event add "myminio/${BUCKET_VIDEO_NAME}" arn:minio:sqs::meukafka:kafka --event put --ignore-existing;
echo '--- Config completed - topic upload-video created ---';
