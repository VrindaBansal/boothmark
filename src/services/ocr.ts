export interface ExtractedData {
  companyName: string;
  boothNumber?: string;
  positions: string[];
  contactInfo: {
    names: string[];
    emails: string[];
    phones: string[];
  };
  deadline?: Date;
  requirements: string[];
  websiteUrl?: string;
  careersPageUrl?: string;
  rawText: string;
  confidence: number;
}

const EXTRACTION_PROMPT = `Extract the following information from this career fair handout/flyer/document:
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

export async function processImageWithOCR(
  imageData: string,
  onProgress?: (progress: number) => void
): Promise<ExtractedData> {
  // Use GPT-4o-mini for OCR (much cheaper and better than Tesseract)
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  if (onProgress) onProgress(50);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Much cheaper than gpt-4o: $0.15/1M input tokens vs $2.50/1M
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: EXTRACTION_PROMPT
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to process image with OpenAI');
  }

  if (onProgress) onProgress(100);

  const result = await response.json();
  const content = result.choices[0].message.content;

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from OpenAI response');
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
    rawText: content,
    confidence: 95 // GPT-4o-mini has high accuracy for OCR
  };
}


// Compress image before processing
export function compressImage(dataUrl: string, maxWidth = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } else {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}
