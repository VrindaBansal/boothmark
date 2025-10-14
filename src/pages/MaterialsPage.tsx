import { useEffect, useState } from 'react';
import { Upload, FileText, Sparkles, MessageSquare, Loader2, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { generateElevatorPitch, generateRecruiterQuestions, parseResume, ParsedResume, RecruiterQuestion } from '@/services/ai-prep';
import Loader from '@/components/ui/Loader';
import { extractFromPDF } from '@/services/pdf';

export default function MaterialsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resumeText, setResumeText] = useState('');
  const [resumeParsed, setResumeParsed] = useState<ParsedResume | null>(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [elevatorPitch, setElevatorPitch] = useState('');
  const [recruiterQuestions, setRecruiterQuestions] = useState<RecruiterQuestion[]>([]);
  const [targetRoles, setTargetRoles] = useState('');

  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedQuestion, setCopiedQuestion] = useState<number | null>(null);

  useEffect(() => {
    loadMaterials();
  }, [user]);

  const loadMaterials = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_materials')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setResumeText(data.resume_text || '');
        setResumeParsed(data.resume_parsed);
        setResumeFileName(data.resume_file_name || '');
        setElevatorPitch(data.elevator_pitch || '');
        setRecruiterQuestions(data.recruiter_questions || []);
        setTargetRoles(data.target_roles || '');
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsParsingResume(true);
      let text = '';

      if (file.type === 'application/pdf') {
        const result = await extractFromPDF(file);
        text = result.text;
      } else if (file.type === 'text/plain') {
        text = await file.text();
      } else {
        alert('Please upload a PDF or TXT file');
        return;
      }

      setResumeText(text);
      setResumeFileName(file.name);

      // Parse resume with AI
      const parsed = await parseResume(text);
      setResumeParsed(parsed);

      await saveMaterials({
        resume_text: text,
        resume_parsed: parsed,
        resume_file_name: file.name,
        resume_uploaded_at: new Date().toISOString()
      });

      alert('Resume uploaded and parsed successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to process resume');
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleGeneratePitch = async () => {
    if (!resumeText) {
      alert('Please upload a resume first');
      return;
    }

    try {
      setIsGeneratingPitch(true);
      const pitch = await generateElevatorPitch(
        resumeParsed?.summary || resumeText.slice(0, 1000),
        targetRoles
      );
      setElevatorPitch(pitch);
      await saveMaterials({ elevator_pitch: pitch });
    } catch (error) {
      console.error('Error generating pitch:', error);
      alert('Failed to generate elevator pitch');
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!resumeText) {
      alert('Please upload a resume first');
      return;
    }

    try {
      setIsGeneratingQuestions(true);
      const questions = await generateRecruiterQuestions(
        resumeParsed?.summary || resumeText.slice(0, 1000),
        targetRoles
      );
      setRecruiterQuestions(questions);
      await saveMaterials({ recruiter_questions: questions });
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const saveMaterials = async (updates: any) => {
    if (!user) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('user_materials')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving materials:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTargetRoles = async () => {
    await saveMaterials({ target_roles: targetRoles });
  };

  const handleSavePitch = async () => {
    await saveMaterials({ elevator_pitch: elevatorPitch });
  };

  const copyToClipboard = (text: string, type: 'pitch' | 'question', index?: number) => {
    navigator.clipboard.writeText(text);
    if (type === 'pitch') {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    } else if (typeof index === 'number') {
      setCopiedQuestion(index);
      setTimeout(() => setCopiedQuestion(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Materials</h1>
        <p className="text-muted-foreground mt-1">
          Upload your resume and let AI help you prepare for career fairs
        </p>
      </div>

      {/* Resume Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume
          </CardTitle>
          <CardDescription>
            Upload your resume to generate personalized materials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="resume-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors text-center">
                {isParsingResume ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Parsing resume...</p>
                  </div>
                ) : resumeFileName ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-sm font-medium">{resumeFileName}</p>
                    <p className="text-xs text-muted-foreground">Click to upload a different file</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload resume</p>
                    <p className="text-xs text-muted-foreground">PDF or TXT file</p>
                  </div>
                )}
              </div>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isParsingResume}
              />
            </label>
          </div>

          {resumeParsed && (
            <div className="space-y-3 bg-secondary/30 p-4 rounded-lg">
              <h4 className="font-medium text-sm">Parsed Information:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{resumeParsed.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">School:</span>
                  <p className="font-medium">{resumeParsed.school}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Major:</span>
                  <p className="font-medium">{resumeParsed.major}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Graduation:</span>
                  <p className="font-medium">{resumeParsed.graduationYear}</p>
                </div>
              </div>
              {resumeParsed.skills.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {resumeParsed.skills.slice(0, 10).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Target Roles (Optional)</CardTitle>
          <CardDescription>
            Specify roles you're interested in to personalize your materials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="e.g., Software Engineer, Data Analyst, Product Manager"
            value={targetRoles}
            onChange={(e) => setTargetRoles(e.target.value)}
          />
          <Button onClick={handleSaveTargetRoles} size="sm" variant="outline" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </CardContent>
      </Card>

      {/* Elevator Pitch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            AI-Generated Elevator Pitch
          </CardTitle>
          <CardDescription>
            A 30-second introduction tailored to your background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGeneratePitch}
            disabled={!resumeText || isGeneratingPitch}
            className="w-full"
          >
            {isGeneratingPitch ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Elevator Pitch
              </>
            )}
          </Button>

          {elevatorPitch && (
            <div className="space-y-3">
              <Textarea
                value={elevatorPitch}
                onChange={(e) => setElevatorPitch(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={handleSavePitch} size="sm" variant="outline" disabled={isSaving}>
                  Save Changes
                </Button>
                <Button
                  onClick={() => copyToClipboard(elevatorPitch, 'pitch')}
                  size="sm"
                  variant="outline"
                >
                  {copiedPitch ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recruiter Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-zomp" />
            Questions to Ask Recruiters
          </CardTitle>
          <CardDescription>
            Thoughtful questions organized by category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGenerateQuestions}
            disabled={!resumeText || isGeneratingQuestions}
            className="w-full"
          >
            {isGeneratingQuestions ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>

          {recruiterQuestions.length > 0 && (
            <div className="space-y-4">
              {['Company Culture', 'Role-Specific', 'Growth & Development', 'Next Steps'].map(category => {
                const categoryQuestions = recruiterQuestions.filter(q => q.category === category);
                if (categoryQuestions.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-sm text-primary">{category}</h4>
                    <div className="space-y-2">
                      {categoryQuestions.map((q, idx) => {
                        const globalIdx = recruiterQuestions.indexOf(q);
                        return (
                          <div
                            key={globalIdx}
                            className="p-3 bg-secondary/30 rounded-lg flex items-start justify-between gap-2"
                          >
                            <p className="text-sm flex-1">{q.question}</p>
                            <Button
                              onClick={() => copyToClipboard(q.question, 'question', globalIdx)}
                              size="sm"
                              variant="ghost"
                              className="shrink-0"
                            >
                              {copiedQuestion === globalIdx ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
