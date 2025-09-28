import { generateTextContent } from './geminiClient'
import { supabase } from '../lib/supabase'

// Shared Gemini client is provided by geminiClient

export interface ProgressAnalysis {
  overallProgress: number // 0-100
  progressStage: 'Early Recovery' | 'Building Strength' | 'Moving Forward' | 'Thriving'
  completionDate: string // Predicted completion date
  keyInsights: string[]
  emotionalHealing: {
    score: number // 0-100
    description: string
  }
  mentalClarity: {
    score: number // 0-100  
    description: string
  }
  personalGrowth: {
    score: number // 0-100
    description: string
  }
  mainMessage: string
  encouragement: string
  nextSteps: string[]
}

export interface UserProgressData {
  user_id: string
  name?: string
  age?: number
  gender?: string
  personality?: string
  breakup_date: string
  last_contact_date?: string
  streak_start?: string
  goal_days: number
  current_streak: number
  triggers: string[]
  motivations: string[]
  challenges: string[]
  total_pledges?: number
  completed_pledges?: number
  recent_journal_entries?: number
}

// Cache for progress analysis
interface ProgressCache {
  userId: string
  analysis: ProgressAnalysis
  timestamp: number
  dataHash: string
}

let progressCache: ProgressCache | null = null
const PROGRESS_CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours

function generateDataHash(data: UserProgressData): string {
  return btoa(JSON.stringify({
    streak: data.current_streak,
    pledges: data.completed_pledges,
    breakup: data.breakup_date,
    goal: data.goal_days
  }))
}

export async function generateProgressAnalysis(userData: UserProgressData): Promise<ProgressAnalysis> {
  const dataHash = generateDataHash(userData)
  
  // Check cache
  if (progressCache && 
      progressCache.userId === userData.user_id && 
      progressCache.dataHash === dataHash &&
      Date.now() - progressCache.timestamp < PROGRESS_CACHE_DURATION) {
    console.log('Using cached progress analysis')
    return progressCache.analysis
  }

  try {
    console.log('Generating new progress analysis')
    
    const daysSinceBreakup = Math.floor(
      (new Date().getTime() - new Date(userData.breakup_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    const daysSinceContact = userData.last_contact_date ? 
      Math.floor((new Date().getTime() - new Date(userData.last_contact_date).getTime()) / (1000 * 60 * 60 * 24)) : 
      daysSinceBreakup

    const progressPercentage = Math.min(100, Math.round((userData.current_streak / userData.goal_days) * 100))
    
    // Calculate actual completion date
    const remainingDays = Math.max(0, userData.goal_days - userData.current_streak)
    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + remainingDays)
    const formattedCompletionDate = remainingDays === 0 ? 
      'Goal Complete!' : 
      completionDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      })
    
    console.log('Progress calculation:', {
      currentStreak: userData.current_streak,
      goalDays: userData.goal_days,
      remainingDays,
      completionDate: formattedCompletionDate
    })
    
    const prompt = `You are a compassionate relationship recovery coach. Analyze the user's healing progress and speak directly to them in a warm, human tone.

USER DATA:
- Name: ${userData.name || 'friend'}
- Age: ${userData.age ?? 'unknown'}
- Gender: ${userData.gender || 'unspecified'}
- Personality: ${userData.personality || 'unspecified'}
- Days since breakup: ${daysSinceBreakup}
- Days since last contact: ${daysSinceContact}
- Current no-contact streak: ${userData.current_streak} days
- Goal: ${userData.goal_days} days
- Progress: ${progressPercentage}%
- Remaining days to goal: ${remainingDays}
- Calculated completion date: ${formattedCompletionDate}
- Total pledges made: ${userData.total_pledges || 0}
- Pledges completed: ${userData.completed_pledges || 0}
- Main triggers: ${userData.triggers.slice(0, 3).join(', ')}
- Key motivations: ${userData.motivations.slice(0, 2).join(', ')}
- Biggest challenges: ${userData.challenges.slice(0, 2).join(', ')}

STYLE RULES:
- Speak in second person ("you"). Address the user by name once where it flows naturally.
- Use a relatable, encouraging, non-clinical voice appropriate for a ${userData.age ?? 'unknown'}-year-old ${userData.gender || 'person'} with a ${userData.personality || 'friendly'} personality.
- Use contractions (you're, it's, you’ll), vary sentence length, and avoid sounding robotic.
- Keep each description vivid but grounded, with gentle optimism and 30–55 words each.
- No markdown, no headings, no extra commentary outside JSON.

Generate EXACTLY this JSON format (no additional text):
{
  "overallProgress": ${progressPercentage},
  "progressStage": "Early Recovery|Building Strength|Moving Forward|Thriving",
  "completionDate": "${formattedCompletionDate}",
  "keyInsights": [
    "3-4 specific, conversational insights speaking to the user (second person)",
    "Tie to their timeline, triggers, and motivations",
    "Acknowledge both difficulty and growth using warm, natural language"
  ],
  "emotionalHealing": {
    "score": 75,
    "description": "Second-person, warm assessment of emotional progress that feels human and encouraging (30-55 words)"
  },
  "mentalClarity": {
    "score": 80,
    "description": "Second-person, grounded assessment of mental clarity and decision-making with practical framing (30-55 words)"
  },
  "personalGrowth": {
    "score": 70,
    "description": "Second-person reflection highlighting growth, self-awareness, and resilience in a relatable voice (30-55 words)"
  },
  "mainMessage": "Encouraging main message written directly to ${userData.name || 'you'}, warm and human (40-60 words)",
  "encouragement": "Specific encouragement tailored to their age, gender, and personality; conversational and uplifting (30-50 words)",
  "nextSteps": [
    "2-3 specific, achievable next steps phrased as friendly suggestions",
    "Reflect their current stage, triggers, and motivations",
    "Keep language simple, direct, and supportive"
  ]
}`

    const text = await generateTextContent(prompt)
    
    const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim()
    const analysis = JSON.parse(cleanedText)
    
    // Cache the result
    progressCache = {
      userId: userData.user_id,
      analysis,
      timestamp: Date.now(),
      dataHash
    }
    
    return analysis
  } catch (error) {
    console.error('Progress analysis error:', error)
    return generateFallbackAnalysis(userData)
  }
}

function generateFallbackAnalysis(userData: UserProgressData): ProgressAnalysis {
  const daysSinceBreakup = Math.floor(
    (new Date().getTime() - new Date(userData.breakup_date).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  const progressPercentage = Math.min(100, Math.round((userData.current_streak / userData.goal_days) * 100))
  
  let progressStage: ProgressAnalysis['progressStage']
  if (progressPercentage < 25) progressStage = 'Early Recovery'
  else if (progressPercentage < 50) progressStage = 'Building Strength'
  else if (progressPercentage < 80) progressStage = 'Moving Forward'
  else progressStage = 'Thriving'
  
  const remainingDays = Math.max(0, userData.goal_days - userData.current_streak)
  const completionDate = new Date()
  completionDate.setDate(completionDate.getDate() + remainingDays)
  
  const formattedCompletionDate = remainingDays === 0 ? 
    'Goal Complete!' : 
    completionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  
  const name = userData.name || 'You'
  const gender = (userData.gender || '').toLowerCase()
  const pronoun = gender.includes('female') || gender.includes('woman') ? 'she' : gender.includes('male') || gender.includes('man') ? 'he' : 'they'
  const you = 'you'

  return {
    overallProgress: progressPercentage,
    progressStage,
    completionDate: formattedCompletionDate,
    keyInsights: [
      `${name}, you've held ${userData.current_streak} days of no contact—real proof of discipline when it mattered most.`,
      `It's been ${daysSinceBreakup} days since the breakup, and ${you} keep choosing healing over impulse.`,
      `Your follow‑through on pledges shows growing emotional muscle and clearer boundaries.`
    ],
    emotionalHealing: {
      score: Math.min(85, 40 + (userData.current_streak / userData.goal_days) * 45),
      description: `${name}, the feelings can still swing wide right now, and that’s okay. Each day of space is giving your heart room to breathe, lowering reactivity, and building steadier footing. You’re learning to sit with big emotions without letting them run the show—one honest day at a time.`
    },
    mentalClarity: {
      score: Math.min(90, 50 + (userData.current_streak / userData.goal_days) * 40),
      description: `With no‑contact, your mind has more quiet—fewer spikes, more signal. Decisions feel less rushed and more intentional. You’re noticing triggers faster and choosing responses that protect your peace. That calm is the foundation for choices you actually trust.`
    },
    personalGrowth: {
      score: Math.min(80, 35 + (userData.current_streak / userData.goal_days) * 45),
      description: `You’re building real self‑respect: clear boundaries, steadier routines, and a voice that backs your needs. It’s not about perfection—it’s about showing up for yourself, especially on rough days. That’s growth you’ll carry well beyond this chapter.`
    },
    mainMessage: `${userData.current_streak} days without contact is proof of your strength and commitment to healing. Every day forward brings you closer to the peace you deserve.`,
    encouragement: `You’re doing the hard, brave work that future‑you will thank you for. Keep the focus small and kind: today’s boundary, today’s breath, today’s win. Momentum builds quietly—and you’re already moving.`,
    nextSteps: [
      'Reaffirm your boundary each morning in one sentence you believe',
      'Journal one trigger + one calmer response you practiced today',
      'Plan a simple evening routine that helps you land gently'
    ]
  }
}

export async function getUserProgressData(userId: string): Promise<UserProgressData | null> {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return null
    }
    
    // Calculate current streak
    const currentStreak = profile.streak_start ? 
      Math.floor((new Date().getTime() - new Date(profile.streak_start).getTime()) / (1000 * 60 * 60 * 24)) : 0
    
    // Get pledge statistics
    const { data: pledgeStats } = await supabase
      .from('pledges')
      .select('completed')
      .eq('user_id', userId)
    
    const totalPledges = pledgeStats?.length || 0
    const completedPledges = pledgeStats?.filter(p => p.completed).length || 0
    
    return {
      user_id: userId,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      personality: profile.personality,
      breakup_date: profile.breakup_date,
      last_contact_date: profile.last_contact_date,
      streak_start: profile.streak_start,
      goal_days: profile.goal_days || 30,
      current_streak: currentStreak,
      triggers: profile.triggers || [],
      motivations: profile.motivations || [],
      challenges: profile.challenges || [],
      total_pledges: totalPledges,
      completed_pledges: completedPledges
    }
  } catch (error) {
    console.error('Error getting user progress data:', error)
    return null
  }
}

export function clearProgressCache(): void {
  progressCache = null
  console.log('Progress analysis cache cleared')
}

// Clear cache immediately when this module loads (for development)
if (__DEV__) {
  clearProgressCache()
}
