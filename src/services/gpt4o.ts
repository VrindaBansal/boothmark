import { ExtractedData } from './ocr';

const SUMMARY_PROMPT = `Analyze this career fair document and provide a comprehensive, professional summary. Include:

1. **Company Overview**: Brief description of the company and what they do
2. **Key Opportunities**: Summary of positions and roles they're hiring for
3. **Requirements Highlight**: Most important qualifications or skills they're seeking
4. **Next Steps**: Application process, deadlines, and contact information
5. **Why This Matters**: Brief insight on why this opportunity could be valuable

Write in a clear, engaging tone that helps a job seeker quickly understand if this company is a good fit. Be concise but thorough (aim for 150-200 words).`;

const EXTRACTION_PROMPT = `Extract the following information from this career fair handout/flyer:
- Company name
- Open positions (list all)
- Contact information (recruiter names, emails, phone numbers)
- Application deadline (if mentioned)
- Key requirements or qualifications
- Website URL or careers page URL
- Booth number or location (if visible)

Return ONLY valid JSON in this exact format:
{
  "companyName": "string",
  "boothNumber": "string or null",
  "positions": ["array of strings"],
  "contactInfo": {
    "names": ["array"],
    "emails": ["array"],
    "phones": ["array"]
  },
  "deadline": "YYYY-MM-DD or null",
  "requirements": ["array of strings"],
  "websiteUrl": "string or null",
  "careersPageUrl": "string or null"
}`;

export async function processImageWithGPT4o(
  imageData: string,
  apiKey: string,
  extractedText?: string
): Promise<ExtractedData> {
  const content: any[] = [
    {
      type: 'text',
      text: EXTRACTION_PROMPT + (extractedText ? `\n\nExtracted text from document:\n${extractedText}` : '')
    }
  ];

  // Only add image if provided
  if (imageData) {
    content.push({
      type: 'image_url',
      image_url: {
        url: imageData
      }
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to process image with GPT-4o');
  }

  const result = await response.json();
  const responseContent = result.choices[0].message.content;

  // Parse JSON from response
  const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from GPT-4o response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    companyName: parsed.companyName || 'Unknown Company',
    boothNumber: parsed.boothNumber || undefined,
    positions: parsed.positions || [],
    contactInfo: {
      names: parsed.contactInfo?.names || [],
      emails: parsed.contactInfo?.emails || [],
      phones: parsed.contactInfo?.phones || []
    },
    deadline: parsed.deadline ? new Date(parsed.deadline) : undefined,
    requirements: parsed.requirements || [],
    websiteUrl: parsed.websiteUrl || undefined,
    careersPageUrl: parsed.careersPageUrl || undefined,
    rawText: responseContent,
    confidence: 95 // GPT-4o typically has high confidence
  };
}

export async function generateAISummary(
  imageData: string,
  extractedText?: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  const content: any[] = [
    {
      type: 'text',
      text: SUMMARY_PROMPT + (extractedText ? `\n\nDocument content:\n${extractedText}` : '')
    }
  ];

  // Add image if provided
  if (imageData) {
    content.push({
      type: 'image_url',
      image_url: {
        url: imageData,
        detail: 'high'
      }
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate summary with GPT-4o');
  }

  const result = await response.json();
  return result.choices[0].message.content.trim();
}
