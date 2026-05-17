import { ChatGroq } from '@langchain/groq'

let _groqModel: ChatGroq | null = null

export function getGroqModel(): ChatGroq {
  if (!_groqModel) {
    _groqModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY!,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      streaming: true,
    })
  }
  return _groqModel
}
