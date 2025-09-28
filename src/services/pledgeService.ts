import { generateTextContent } from './geminiClient'
import { supabase } from '../lib/supabase'

// Shared Gemini client is provided by geminiClient

// Cache for personalized pledge content during current session
interface PledgeCache {
  userId: string
  date: string
  content: PledgeAnalysis
  timestamp: number
}

let pledgeContentCache: PledgeCache | null = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Helper functions for cache management
function getCacheKey(userId: string): string {
  return `${userId}-${new Date().toISOString().split('T')[0]}`
}

function isCacheValid(cache: PledgeCache, userId: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  const cacheAge = Date.now() - cache.timestamp
  
  return (
    cache.userId === userId &&
    cache.date === today &&
    cacheAge < CACHE_DURATION
  )
}

function setCacheContent(userId: string, content: PledgeAnalysis): void {
  pledgeContentCache = {
    userId,
    date: new Date().toISOString().split('T')[0],
    content,
    timestamp: Date.now()
  }
}

function getCachedContent(userId: string): PledgeAnalysis | null {
  if (!pledgeContentCache) return null
  
  if (isCacheValid(pledgeContentCache, userId)) {
    return pledgeContentCache.content
  }
  
  // Clear invalid cache
  pledgeContentCache = null
  return null
}

export function clearPledgeCache(): void {
  pledgeContentCache = null
  console.log('Pledge content cache cleared')
}

export function getPledgeCacheInfo(): { hasCache: boolean; cacheDate?: string; userId?: string } {
  if (!pledgeContentCache) {
    return { hasCache: false }
  }
  
  return {
    hasCache: true,
    cacheDate: pledgeContentCache.date,
    userId: pledgeContentCache.userId
  }
}

export interface PledgeAnalysis {
  personalizedCompliment: string
  motivationalReminder: string
  dailyAffirmation: string
  progressInsight: string
  encouragement: string
}

export interface PledgeRecord {
  id?: string
  user_id: string
  pledge_date: string
  completed: boolean
  check_in_date?: string
  created_at?: string
}

export async function generatePersonalizedPledgeContent(profile: any): Promise<PledgeAnalysis> {
  // Check if we have valid cached content for this user
  if (profile.user_id) {
    const cachedContent = getCachedContent(profile.user_id)
    if (cachedContent) {
      console.log('Using cached pledge content for user:', profile.user_id)
      return cachedContent
    }
  }

  try {
    console.log('Generating new AI pledge content for user:', profile.user_id)
    
    const daysSinceBreakup = profile.breakup_date ? 
      Math.floor((new Date().getTime() - new Date(profile.breakup_date).getTime()) / (1000 * 60 * 60 * 24)) : 0
    
    const daysSinceContact = profile.last_contact_date ? 
      Math.floor((new Date().getTime() - new Date(profile.last_contact_date).getTime()) / (1000 * 60 * 60 * 24)) : 0
    
    const currentStreak = profile.streak_start ? 
      Math.floor((new Date().getTime() - new Date(profile.streak_start).getTime()) / (1000 * 60 * 60 * 24)) : 0

    const prompt = `You are a compassionate relationship recovery coach. Generate personalized content for someone making a daily no-contact pledge.

USER PROFILE:
- Name: ${profile.name || 'there'}
- Age: ${profile.age ?? 'unknown'}
- Gender: ${profile.gender || 'unspecified'}
- Personality: ${profile.personality || 'unspecified'}
- Days since breakup: ${daysSinceBreakup}
- Days since last contact: ${daysSinceContact}
- Current streak: ${currentStreak} days
- Goal: ${profile.goal_days || 30} days no contact
- Triggers: ${profile.triggers?.join(', ') || 'Not specified'}
- Motivations: ${profile.motivations?.join(', ') || 'Personal growth'}
- Challenges: ${profile.challenges?.join(', ') || 'General emotional difficulties'}

STYLE RULES:
- Speak in second person, directly to ${profile.name || 'the user'}.
- Use warm, human, relatable language (not clinical). Use contractions and vary sentence length.
- Reflect their age, gender, and personality where helpful in word choice and examples.
- Keep each field within the requested length and avoid markdown or extra commentary.

Generate EXACTLY this JSON format (no additional text):
{
  "personalizedCompliment": "A genuine, specific compliment about their progress or strength (40-60 words)",
  "motivationalReminder": "A reminder of why they're doing this, referencing their motivations (30-50 words)", 
  "dailyAffirmation": "A powerful daily affirmation for today (15-25 words)",
  "progressInsight": "An insight about their journey or progress so far (35-55 words)",
  "encouragement": "Encouraging words for today specifically (25-40 words)"
}`

    const text = await generateTextContent(prompt)
    
    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim()
    const analysis = JSON.parse(cleanedText)
    
    // Cache the generated content
    if (profile.user_id) {
      setCacheContent(profile.user_id, analysis)
    }
    
    return analysis
  } catch (error) {
    console.error('AI Pledge Content Error:', error)
    const fallbackContent = generateFallbackContent(profile)
    
    // Cache fallback content too
    if (profile.user_id) {
      setCacheContent(profile.user_id, fallbackContent)
    }
    
    return fallbackContent
  }
}

function generateFallbackContent(profile: any): PledgeAnalysis {
  const name = profile.name || 'there'
  const age = profile.age ? ` ${profile.age}` : ''
  const gender = profile.gender ? `${profile.gender}` : ''
  const persona = [age && `${age}-year-old`, gender].filter(Boolean).join(' ')
  const daysSinceBreakup = profile.breakup_date ? 
    Math.floor((new Date().getTime() - new Date(profile.breakup_date).getTime()) / (1000 * 60 * 60 * 24)) : 0
  
  const currentStreak = profile.streak_start ? 
    Math.floor((new Date().getTime() - new Date(profile.streak_start).getTime()) / (1000 * 60 * 60 * 24)) : 0

  return {
    personalizedCompliment: `${name}, the way you keep showing up for yourself is real strength. ${currentStreak > 0 ? `That ${currentStreak}-day streak didn’t happen by accident—you earned it with small, steady choices.` : 'Starting is the hardest part, and you just did it. That’s brave.'} ${persona ? `For a ${persona}, that kind of self-respect stands out.` : ''}`,
    motivationalReminder: `You’re doing this to protect your peace and rebuild trust with yourself. Every day of no‑contact is a vote for your future—clearer mind, calmer heart, stronger boundaries. Keep it small and doable: today’s boundary, today’s breath, today’s win.`,
    dailyAffirmation: `I protect my peace, honor my boundaries, and choose the future I deserve.`,
    progressInsight: `${daysSinceBreakup > 30 ? 'You’ve already proven you can live without the constant pull. The space you’re creating is where clarity and self-respect grow.' : 'Early days can feel wobbly. That’s normal. Each day of space lowers the emotional spikes and makes your choices feel steadier.'}`,
    encouragement: `You’re closer than you think. Keep it gentle and consistent—no perfect days required. If it helps, text yourself one sentence you believe. You’ve got this.`
  }
}

export async function savePledge(userId: string): Promise<PledgeRecord> {
  const pledgeData = {
    user_id: userId,
    pledge_date: new Date().toISOString().split('T')[0], // Today's date
    completed: false,
    created_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('pledges')
    .insert([pledgeData])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getTodaysPledge(userId: string): Promise<PledgeRecord | null> {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('pledges')
    .select('*')
    .eq('user_id', userId)
    .eq('pledge_date', today)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw error
  }

  return data
}

export async function updatePledgeCompletion(pledgeId: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('pledges')
    .update({ 
      completed,
      check_in_date: completed ? new Date().toISOString() : null 
    })
    .eq('id', pledgeId)

  if (error) {
    throw error
  }
}
