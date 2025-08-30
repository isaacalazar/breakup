import { GoogleGenerativeAI } from '@google/generative-ai'

// You'll need to add your Gemini API key to your environment variables
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'your-api-key-here'

const genAI = new GoogleGenerativeAI(API_KEY)

export interface UserResponses {
  gender: string
  breakupDate: string
  lastContactDate: string
  lastContactTime: string
  lastContactPreset: string
  goalDays: string
  selectedGoalDays: number | null
  triggers: string[]
  challenges: string[]
  panicTools: string[]
  motivations: string[]
  readiness: string
  attachment: string
}

export interface AIAnalysisResult {
  attachmentLevel: 'Low Attachment' | 'Moderate Attachment' | 'High Attachment' | 'Severe Attachment'
  attachmentScore: number
  averageComparison: number
  recoveryTimelineWeeks: number
  personalizedInsights: string
  recommendedActions: string[]
  riskFactors: string[]
}

export async function analyzeAttachmentWithAI(userResponses: UserResponses): Promise<AIAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const prompt = createAnalysisPrompt(userResponses)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    return parseAIResponse(text)
  } catch (error) {
    console.error('AI Analysis Error:', error)
    // Fallback to calculated analysis if AI fails
    return calculateFallbackAnalysis(userResponses)
  }
}

function createAnalysisPrompt(responses: UserResponses): string {
  const daysSinceBreakup = responses.breakupDate ? 
    Math.floor((new Date().getTime() - new Date(responses.breakupDate).getTime()) / (1000 * 60 * 60 * 24)) : 
    'unknown'
  
  const daysSinceContact = responses.lastContactDate ? 
    Math.floor((new Date().getTime() - new Date(responses.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)) : 
    'unknown'

  return `You are a professional relationship counselor and attachment specialist. Analyze the following post-breakup assessment data and provide ONLY an attachment score.

USER DATA:
- Attachment Intensity (1-10 scale): ${responses.attachment}
- Readiness for No Contact (1-10 scale): ${responses.readiness}
- Days since breakup: ${daysSinceBreakup}
- Days since last contact: ${daysSinceContact}
- Identified triggers: ${responses.triggers.join(', ') || 'None specified'}
- Challenges faced: ${responses.challenges.join(', ') || 'None specified'}
- Coping tools: ${responses.panicTools.join(', ') || 'None specified'}
- Motivations: ${responses.motivations.join(', ') || 'None specified'}
- Recovery goal: ${responses.selectedGoalDays || responses.goalDays} days

REQUIREMENTS:
Calculate an attachment score from 52-100 based on their responses. The score should always be above the population average of 50%. Higher attachment intensity, more triggers, recent breakup, recent contact, and lower readiness should result in higher scores.

Respond with ONLY the numerical score (no explanation, no text, just the number):`
}

function parseAIResponse(text: string): AIAnalysisResult {
  try {
    // Extract the numerical score from the response
    const scoreMatch = text.match(/(\d+)/)
    if (!scoreMatch) {
      throw new Error('No score found in response')
    }
    
    const attachmentScore = parseInt(scoreMatch[0], 10)
    
    // Ensure score is within valid range
    const validatedScore = Math.max(52, Math.min(100, attachmentScore))
    
    // Determine attachment level based on score
    let attachmentLevel: AIAnalysisResult['attachmentLevel']
    if (validatedScore <= 60) attachmentLevel = 'Moderate Attachment'
    else if (validatedScore <= 75) attachmentLevel = 'High Attachment'
    else attachmentLevel = 'Severe Attachment'
    
    // Calculate recovery timeline based on score
    const recoveryTimelineWeeks = Math.max(6, Math.min(20, Math.round((validatedScore / 100) * 20)))
    
    return {
      attachmentLevel,
      attachmentScore: validatedScore,
      averageComparison: 50,
      recoveryTimelineWeeks,
      personalizedInsights: `Based on your responses, you show ${attachmentLevel.toLowerCase()} with a score of ${validatedScore}/100. Your specific pattern of triggers and challenges suggests a ${recoveryTimelineWeeks}-week recovery timeline with focused no-contact commitment.`,
      recommendedActions: [
        'Maintain strict no-contact boundaries',
        'Practice daily mindfulness and self-care',
        'Build new routines and social connections',
        'Consider professional support if needed',
        'Track your emotional progress daily'
      ],
      riskFactors: [
        'Emotional triggers from shared memories',
        'Social media exposure to ex-partner',
        'Loneliness during vulnerable moments'
      ]
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    throw error
  }
}

function calculateFallbackAnalysis(responses: UserResponses): AIAnalysisResult {
  // Fallback calculation that ensures scores are always above 50% (average)
  const attachmentIntensity = ((parseInt(responses.attachment) || 5) - 1) / 9
  const readiness = 1 - ((parseInt(responses.readiness) || 5) - 1) / 9
  const triggerScore = Math.min(responses.triggers.length / 15, 1)
  const challengeScore = Math.min(responses.challenges.length / 15, 1)
  
  const calculateRecency = (dateString: string, maxDays: number) => {
    if (!dateString) return 0.5
    const date = new Date(dateString)
    const daysSince = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, Math.min(1, 1 - (daysSince / maxDays)))
  }
  
  const breakupRecency = calculateRecency(responses.breakupDate, 365)
  const contactRecency = calculateRecency(responses.lastContactDate, 180)
  
  // Calculate base score then ensure it's always above 52
  const baseScore = (
    attachmentIntensity * 0.30 +
    readiness * 0.20 +
    triggerScore * 0.10 +
    challengeScore * 0.10 +
    breakupRecency * 0.15 +
    contactRecency * 0.15
  )
  
  // Scale to 52-100 range to ensure always above average
  const weightedScore = Math.round(52 + (baseScore * 48))
  
  let attachmentLevel: AIAnalysisResult['attachmentLevel']
  if (weightedScore <= 60) attachmentLevel = 'Moderate Attachment'
  else if (weightedScore <= 75) attachmentLevel = 'High Attachment'
  else attachmentLevel = 'Severe Attachment'
  
  const recoveryWeeks = Math.max(6, Math.min(20, Math.round((weightedScore / 100) * 20)))
  
  return {
    attachmentLevel,
    attachmentScore: weightedScore,
    averageComparison: 50,
    recoveryTimelineWeeks: recoveryWeeks,
    personalizedInsights: `Based on your responses, you show ${attachmentLevel.toLowerCase()} with a calculated score of ${weightedScore}/100. Your specific pattern of triggers and challenges suggests a ${recoveryWeeks}-week recovery timeline with focused no-contact commitment.`,
    recommendedActions: [
      'Maintain strict no-contact boundaries',
      'Practice daily mindfulness and self-care',
      'Build new routines and social connections',
      'Consider professional support if needed',
      'Track your emotional progress daily'
    ],
    riskFactors: [
      'Emotional triggers from shared memories',
      'Social media exposure to ex-partner',
      'Loneliness during vulnerable moments'
    ]
  }
}