export interface VideoProcessorPort {
  generateScreenshots(
    videoPath: string,
    outputDir: string,
    count?: number,
  ): Promise<void>;
}
