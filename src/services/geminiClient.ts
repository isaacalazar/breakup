import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
const DEFAULT_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash'

let genAI: GoogleGenerativeAI | null = null

export function getGenAI(): GoogleGenerativeAI {
  if (!API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY')
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY)
  }
  return genAI
}

export function getModel(modelId: string = DEFAULT_MODEL) {
  const client = getGenAI()
  return client.getGenerativeModel({ model: modelId })
}

export const GEMINI_DEFAULT_MODEL = DEFAULT_MODEL

export async function generateTextContent(prompt: string): Promise<string> {
  const model = getModel(DEFAULT_MODEL)
  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  if (!text) throw new Error('Empty response text')
  return text
}
