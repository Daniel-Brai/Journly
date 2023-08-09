import { v4 as uuidv4 } from 'uuid';

export function createRandomString(): string {
  return uuidv4();
}
