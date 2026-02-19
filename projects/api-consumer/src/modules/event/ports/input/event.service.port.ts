export interface EventServicePort {
  handleVideoUpload(payload: any): Promise<void>;
}
