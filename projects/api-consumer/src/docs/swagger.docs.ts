import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

export class SwaggerDoc {
  setupDocs = (app: INestApplication) => {
    const title = 'Service Consumer Video Screenshot Generator';
    const description = `Service Consumer Video Screenshot Generator`;
    const version = '1.0.0';

    const config = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version)
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document);
    
    // Only write file in development mode
    if (process.env.NODE_ENV === 'development') {
      try {
        writeFileSync('./swagger-docs.json', JSON.stringify(document));
      } catch (error) {
        console.warn('⚠️ Could not write swagger-docs.json:', error.message);
      }
    }
  };
}
