/**
 * AI-powered preparation tools for career fairs
 */

const ELEVATOR_PITCH_PROMPT = `You are a career coach helping a student prepare for a career fair.

Based on the following information, create a compelling 30-second elevator pitch:

Resume Summary:
{resumeText}

Target Companies/Roles:
{targetInfo}

Instructions:
- Keep it to 30 seconds (about 75 words)
- Start with a hook (name, school, major)
- Highlight 2-3 key achievements or skills
- Express clear interest in the field/role
- End with a question or conversation starter
- Make it natural and conversational

Return ONLY the elevator pitch text, no additional commentary.`;

const RECRUITER_QUESTIONS_PROMPT = `You are a career coach helping a student prepare questions to ask recruiters at a career fair.

Based on the following information, generate 8-10 thoughtful questions:

Resume Summary:
{resumeText}

Target Companies/Roles:
{targetInfo}

Create questions in these categories:
1. Company Culture (2-3 questions)
2. Role-Specific (2-3 questions)
3. Growth & Development (2-3 questions)
4. Next Steps (1-2 questions)

Instructions:
- Make questions specific and insightful
- Avoid yes/no questions
- Show genuine interest and research
- Mix technical and cultural questions
- Include 1-2 questions that reference their background/experience

Return as a JSON array with this format:
[
  {"category": "Company Culture", "question": "..."},
  {"category": "Role-Specific", "question": "..."}
]`;

const RESUME_PARSER_PROMPT = `Extract key information from this resume text and return a structured summary.

Resume Text:
{resumeText}

Return ONLY valid JSON in this format:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "school": "string",
  "major": "string",
  "graduationYear": "string",
  "gpa": "string or null",
  "skills": ["array of skills"],
  "experience": [
    {"company": "string", "role": "string", "duration": "string", "description": "string"}
  ],
  "projects": [
    {"name": "string", "description": "string", "technologies": ["array"]}
  ],
  "summary": "2-3 sentence professional summary"
}`;

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  school: string;
  major: string;
  graduationYear: string;
  gpa?: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  summary: string;
  rawText: string;
}

export interface RecruiterQuestion {
  category: string;
  question: string;
}

export async function generateElevatorPitch(
  resumeText: string,
  targetInfo?: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = ELEVATOR_PITCH_PROMPT
    .replace('{resumeText}', resumeText)
    .replace('{targetInfo}', targetInfo || 'Various roles in the field');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate elevator pitch');
  }

  const result = await response.json();
  return result.choices[0].message.content.trim();
}

export async function generateRecruiterQuestions(
  resumeText: string,
  targetInfo?: string
): Promise<RecruiterQuestion[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = RECRUITER_QUESTIONS_PROMPT
    .replace('{resumeText}', resumeText)
    .replace('{targetInfo}', targetInfo || 'Various roles in the field');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.8
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate questions');
  }

  const result = await response.json();
  const content = result.choices[0].message.content;

  // Parse JSON from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse questions from response');
  }

  return JSON.parse(jsonMatch[0]);
}

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = RESUME_PARSER_PROMPT.replace('{resumeText}', resumeText);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to parse resume');
  }

  const result = await response.json();
  const content = result.choices[0].message.content;

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse resume data from response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    ...parsed,
    rawText: resumeText
  };
}

// Generate personalized follow-up email
export async function generateFollowUpEmail(
  type: 'linkedin' | 'coffee-chat' | 'internship',
  companyName: string,
  recruiterName: string,
  resumeSummary: string,
  conversationNotes?: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const typePrompts = {
    linkedin: 'a brief, friendly LinkedIn connection request message (2-3 sentences)',
    'coffee-chat': 'a polite email requesting a coffee chat or informational interview',
    internship: 'a professional email expressing strong interest in internship opportunities'
  };

  const prompt = `Write ${typePrompts[type]} for a student following up after meeting a recruiter at a career fair.

Details:
- Company: ${companyName}
- Recruiter: ${recruiterName}
- Student Background: ${resumeSummary}
${conversationNotes ? `- Conversation Notes: ${conversationNotes}` : ''}

Requirements:
- Professional but warm tone
- Reference specific details from their background
- Show genuine interest and enthusiasm
- Include a clear call to action
- Keep it concise (150-200 words for email, 50-75 for LinkedIn)
${type === 'linkedin' ? '- No subject line needed for LinkedIn' : '- Include subject line'}

Return ONLY the ${type === 'linkedin' ? 'message' : 'email'} text (with subject line if email), no additional commentary.`;

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
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate follow-up email');
  }

  const result = await response.json();
  return result.choices[0].message.content.trim();
}
