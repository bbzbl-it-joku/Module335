
import { Injectable } from '@angular/core';
import { Report, ReportStatus } from 'src/app/models';
import { supabase } from 'src/app/supabase/supabase.config';
import { BaseService, QueryResult, QueryResultList } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends BaseService<Report> {
  protected tableName = 'reports';

  private mapReportResponse(report: any): Report {
    return {
      id: report.id,
      userId: report.user_id,
      title: report.title,
      description: report.description,
      status: report.status as ReportStatus,
      mediaUrls: report.media_urls || [],
      createdAt: new Date(report.created_at),
      updatedAt: new Date(report.updated_at),
      category: {
        id: report.categories.id,
        name: report.categories.name,
        description: report.categories.description,
        iconName: report.categories.icon_name,
        createdAt: new Date(report.categories.created_at)
      }
    };
  }

  async getAll(): Promise<QueryResultList<Report>> {
    const response = await supabase
      .from(this.tableName)
      .select('*, categories(*)')
      .order('created_at', { ascending: false });

    if (response.data) {
      response.data = response.data.map(this.mapReportResponse);
    }

    return response;
  }

  async getPaged(page: number, limit: number): Promise<QueryResultList<Report>> {
    const response = await supabase
      .from(this.tableName)
      .select('*, categories(*)')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (response.data) {
      response.data = response.data.map(this.mapReportResponse);
    }

    return response;
  }

  async getById(id: string): Promise<QueryResult<Report>> {
    const response = await supabase
      .from(this.tableName)
      .select('*, categories(*)')
      .eq('id', id)
      .single();

    if (response.data) {
      response.data = this.mapReportResponse(response.data);
    }

    return response;
  }

  async getByStatus(status: ReportStatus): Promise<QueryResultList<Report>> {
    const response = await supabase
      .from(this.tableName)
      .select('*, categories(*)')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (response.data) {
      response.data = response.data.map(this.mapReportResponse);
    }

    return response;
  }

  async getByUserId(userId: string): Promise<QueryResultList<Report>> {
    const response = await supabase
      .from(this.tableName)
      .select('*, categories(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (response.data) {
      response.data = response.data.map(this.mapReportResponse);
    }

    return response;
  }

  async create(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>, user_id: string): Promise<QueryResult<Report>> {
    console.log('Creating report with data:', JSON.stringify(report, null, 2));

    try {
      const { category, mediaUrls, ...rest } = report;
      if (!category?.id) {
        throw new Error('Category ID is required');
      }      const payload = { ...rest, user_id, category_id: category.id, media_urls: mediaUrls, created_at: new Date() };
      console.log('Sending payload to Supabase:', JSON.stringify(payload, null, 2));

      const result = await supabase
        .from(this.tableName)
        .insert(payload)
        .select()
        .single();

      console.log('Supabase response:', result);
      return result;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: ReportStatus): Promise<QueryResult<Report>> {
    return await supabase
      .from(this.tableName)
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
  }

  async update(id: string, report: Partial<Report>) {
    const { category, mediaUrls, ...rest } = report;
    const payload = {
      ...rest,
      category_id: category?.id,  // If category is included in the update
      media_urls: mediaUrls,      // Snake case conversion
      updated_at: new Date()
    };
    return await supabase
      .from(this.tableName)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
  }

  async delete(id: string): Promise<QueryResult<Report>> {
    return await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();
  }
}
