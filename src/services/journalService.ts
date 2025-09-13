import { supabase } from '../lib/supabase'

export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  mood: number
  body: string
  created_at?: string
  updated_at?: string
}

export interface JournalEntryCreate {
  entry_date: string
  mood: number
  body: string
}

export interface JournalEntryUpdate {
  mood?: number
  body?: string
}

export interface JournalEntriesGrouped {
  [date: string]: JournalEntry[]
}

export const journalService = {
  // Get today's entries for the current user
  async getTodayEntries(): Promise<JournalEntry[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('entry_date', today)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get entries for a specific date
  async getEntriesForDate(date: string): Promise<JournalEntry[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('entry_date', date)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create a new entry (always creates new, never updates)
  async createEntry(entry: JournalEntryCreate): Promise<JournalEntry> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: session.user.id,
        entry_date: entry.entry_date,
        mood: entry.mood,
        body: entry.body,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get recent entries (last 30 days by default) grouped by date
  async getRecentEntries(days: number = 30): Promise<JournalEntry[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(days * 5) // Allow up to 5 entries per day

    if (error) throw error
    return data || []
  },

  // Get recent entries grouped by date for easier UI handling
  async getRecentEntriesGrouped(days: number = 30): Promise<JournalEntriesGrouped> {
    const entries = await this.getRecentEntries(days)
    const grouped: JournalEntriesGrouped = {}
    
    entries.forEach(entry => {
      if (!grouped[entry.entry_date]) {
        grouped[entry.entry_date] = []
      }
      grouped[entry.entry_date].push(entry)
    })
    
    return grouped
  },

  // Get entry by ID
  async getEntryById(id: string): Promise<JournalEntry | null> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data
  },

  // Update an existing entry by ID
  async updateEntry(id: string, updates: JournalEntryUpdate): Promise<JournalEntry> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', session.user.id)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete an entry by ID
  async deleteEntry(id: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('user_id', session.user.id)
      .eq('id', id)

    if (error) throw error
  },

  // Get entries within a date range
  async getEntriesByDateRange(startDate: string, endDate: string): Promise<JournalEntry[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get mood statistics
  async getMoodStats(): Promise<{ averageMood: number; totalEntries: number }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('journal_entries')
      .select('mood')
      .eq('user_id', session.user.id)

    if (error) throw error
    
    if (!data || data.length === 0) {
      return { averageMood: 0, totalEntries: 0 }
    }

    const totalMood = data.reduce((sum, entry) => sum + entry.mood, 0)
    const averageMood = Math.round((totalMood / data.length) * 10) / 10 // Round to 1 decimal

    return {
      averageMood,
      totalEntries: data.length,
    }
  }
}