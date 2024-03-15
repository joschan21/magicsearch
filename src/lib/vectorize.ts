import { openai } from './openai'

export const vectorize = async (input: string): Promise<number[]> => {
  const embeddingResponse = await openai.embeddings.create({
    input,
    model: 'text-embedding-ada-002',
  })

  const vector = embeddingResponse.data[0].embedding

  return vector
}
