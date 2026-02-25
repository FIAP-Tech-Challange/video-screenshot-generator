#!/bin/sh

echo '--- initializing config ---';

until mc alias set myminio ${MINIO_URL} $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD; do
  echo 'Minio not ready. Retrying in 2s...';
  sleep 2;
done;

echo 'Minio ready!';

mc mb myminio/$BUCKET_VIDEO_NAME --ignore-existing;
echo "Bucket $BUCKET_VIDEO_NAME created.";
mc mb myminio/$BUCKET_SCREENSHOT_NAME --ignore-existing;
echo "Bucket $BUCKET_SCREENSHOT_NAME created.";

mc event add myminio/$BUCKET_VIDEO_NAME arn:minio:sqs::meukafka:kafka --event put --ignore-existing;
echo '--- Config completed - topic upload-video created ---';
