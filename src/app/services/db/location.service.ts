import { Injectable } from '@angular/core';
import { Location } from 'src/app/models';
import { supabase } from 'src/app/supabase/supabase.config';
import { BaseService, QueryResult } from './base.service';

type DbLocation = {
  id?: string;
  report_id: string;
  latitude: number;
  longitude: number;
  extra_data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

@Injectable({
  providedIn: 'root'
})
export class LocationService extends BaseService<Location> {
  protected tableName = 'location';

  private toDbModel(location: Partial<Location>): Partial<DbLocation> {
    const dbLocation: Partial<DbLocation> = {};

    if (location.id) dbLocation.id = location.id;
    if (location.reportId) dbLocation.report_id = location.reportId;
    if (location.latitude !== undefined) dbLocation.latitude = location.latitude;
    if (location.longitude !== undefined) dbLocation.longitude = location.longitude;
    if (location.extraData) dbLocation.extra_data = location.extraData;
    if (location.createdAt) dbLocation.created_at = location.createdAt.toISOString();
    if (location.updatedAt) dbLocation.updated_at = location.updatedAt.toISOString();

    return dbLocation;
  }

  private fromDbModel(dbLocation: any): Location {
    return {
      id: dbLocation.id,
      reportId: dbLocation.report_id,
      latitude: dbLocation.latitude,
      longitude: dbLocation.longitude,
      extraData: dbLocation.extra_data || {},
      createdAt: dbLocation.created_at ? new Date(dbLocation.created_at) : undefined,
      updatedAt: dbLocation.updated_at ? new Date(dbLocation.updated_at) : undefined
    };
  }

  async getAll(): Promise<QueryResult<Location[]>> {
    console.log('Getting all locations');

    const result = await supabase
      .from(this.tableName)
      .select('*');

    if (result.data) {
      result.data = result.data.map(this.fromDbModel);
    }

    return result;
  }

  async getByReportId(reportId: string): Promise<QueryResult<Location>> {
    const result = await supabase
      .from(this.tableName)
      .select('*')
      .eq('report_id', reportId)
      .single();

    if (result.data) {
      result.data = this.fromDbModel(result.data);
    }

    return result;
  }

  async create(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<QueryResult<Location>> {
    const result = await supabase
      .from(this.tableName)
      .insert(this.toDbModel(location))
      .select()
      .single();

    if (result.data) {
      result.data = this.fromDbModel(result.data);
    }

    return result;
  }

  async update(id: string, location: Partial<Location>): Promise<QueryResult<Location>> {
    const dbLocation = this.toDbModel(location);
    dbLocation.updated_at = new Date().toISOString();

    const result = await supabase
      .from(this.tableName)
      .update(dbLocation)
      .eq('id', id)
      .select()
      .single();

    if (result.data) {
      result.data = this.fromDbModel(result.data);
    }

    return result;
  }

  async delete(id: string): Promise<QueryResult<Location>> {
    const result = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (result.data) {
      result.data = this.fromDbModel(result.data);
    }

    return result;
  }
}
