export type UploadObjectEventPayload = {
  EventName: string;
  Key: string;
  Records: {
    s3: {
      bucket: {
        name: string;
      };
      object: {
        key: string;
        size: number;
        contentType: string;
      };
    };
  }[];
};
