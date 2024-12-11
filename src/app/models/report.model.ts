import { Report } from './types';
import { reportSchema } from './schemas';

export class ReportModel {
  private data: Report;

  constructor(data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) {
    this.data = reportSchema.parse(data);
  }

  public toJSON(): Report {
    return this.data;
  }
}
