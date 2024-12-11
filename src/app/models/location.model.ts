import { Location } from './types';
import { locationSchema } from './schemas';

export class LocationModel {
  private data: Location;

  constructor(data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) {
    this.data = locationSchema.parse(data);
  }

  public toJSON(): Location {
    return this.data;
  }
}
