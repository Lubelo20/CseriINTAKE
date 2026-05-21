import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const locales: Record<string, string> = {
  af: 'Afrikaans',
  zu: 'isiZulu',
  xh: 'isiXhosa',
  st: 'Sesotho',
  tn: 'Setswana',
  nso: 'Sepedi (Northern Sotho)',
  ts: 'Xitsonga',
  ss: 'siSwati',
  ve: 'Tshivenḓa',
  nr: 'isiNdebele',
}

async function translate(content: object, targetLanguage: string): Promise<object> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `Translate the following JSON object values into ${targetLanguage}.
Keep all JSON keys exactly as-is. Only translate the string values.
Do not translate: reference codes (CSERI-*), email addresses, URLs, proper nouns like "CSERI", "DUT", "POPIA", "KwaZulu-Natal", province names, or category names that are international terms.
Return only valid JSON with no additional text or markdown.

${JSON.stringify(content, null, 2)}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text)
}

async function main() {
  const enPath = path.join(process.cwd(), 'messages', 'en.json')
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'))

  for (const [code, name] of Object.entries(locales)) {
    console.log(`Translating to ${name} (${code})...`)
    const translated = await translate(enContent, name)
    const outPath = path.join(process.cwd(), 'messages', `${code}.json`)
    fs.writeFileSync(outPath, JSON.stringify(translated, null, 2))
    console.log(`  ✓ Written to messages/${code}.json`)
  }
}

main().catch(console.error)
