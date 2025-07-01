import { SupabaseClient } from '@supabase/supabase-js';

export interface Artwork {
  id: string;
  title: string;
  description?: string;
  artist_id: string;
  medium: string;
  dimensions?: string;
  year_created?: number;
  price: number;
  status: 'draft' | 'active' | 'archived';
  image_url?: string;
  additional_images?: string[];
  data?: Record<string, unknown>;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ArtworkWithArtist extends Artwork {
  artist_name: string;
  artist_bio?: string;
  artist_instagram?: string;
}

export class ArtworkClient {
  constructor(private supabase: SupabaseClient) {}

  async getAllArtwork(): Promise<ArtworkWithArtist[]> {
    const { data, error } = await this.supabase
      .from('artwork_with_artist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getArtworkByArtist(artistId: string): Promise<Artwork[]> {
    const { data, error } = await this.supabase
      .from('artwork')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getArtworkById(id: string): Promise<ArtworkWithArtist | null> {
    const { data, error } = await this.supabase
      .from('artwork_with_artist')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createArtwork(artwork: Omit<Artwork, 'id' | 'created_at' | 'updated_at'>): Promise<Artwork> {
    const { data, error } = await this.supabase
      .from('artwork')
      .insert(artwork)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateArtwork(id: string, updates: Partial<Artwork>): Promise<Artwork> {
    const { data, error } = await this.supabase
      .from('artwork')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteArtwork(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('artwork')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getActiveArtwork(): Promise<ArtworkWithArtist[]> {
    const { data, error } = await this.supabase
      .from('artwork_with_artist')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
} 