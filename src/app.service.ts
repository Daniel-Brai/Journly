import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class AppService {
  getRoot(res: Response) {
    return res.render('index', {
      title: 'Journly - All-in-one Real time Polling',
    });
  }
}
