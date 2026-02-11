import { Injectable } from '@nestjs/common';

export interface ApiStatus {
  service: string;
  status: string;
}

@Injectable()
export class AppService {
  private readonly serviceName = 'Miniflow API';

  getStatus(): ApiStatus {
    return {
      service: this.serviceName,
      status: 'running',
    };
  }
}
