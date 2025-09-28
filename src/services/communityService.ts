import { supabase } from '../lib/supabase'

export interface CommunityPost {
  id: string
  user_id: string
  title: string
  body: string
  created_at: string
  author_name: string | null
  upvotes_count: number
}

export interface CreateCommunityPost {
  title: string
  body: string
}

export const communityService = {
  async listPosts(limit: number = 50): Promise<CommunityPost[]> {
    // Expects SQL schema to provide a view named community_feed
    const { data, error } = await supabase
      .from('community_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data as unknown as CommunityPost[]) || []
  },

  async createPost(payload: CreateCommunityPost): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('community_posts')
      .insert({
        user_id: session.user.id,
        title: payload.title,
        body: payload.body,
      })

    if (error) throw error
  },

  async toggleUpvote(postId: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')

    // Check if user already voted
    const { data: existing, error: selectErr } = await supabase
      .from('post_votes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (selectErr && selectErr.code !== 'PGRST116') throw selectErr

    if (existing) {
      // Remove vote
      const { error } = await supabase
        .from('post_votes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
      if (error) throw error
    } else {
      // Add vote
      const { error } = await supabase
        .from('post_votes')
        .insert({ post_id: postId, user_id: session.user.id })
      if (error) throw error
    }
  }
}


