import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PollAccessGuard extends AuthGuard('poll-access') {}
