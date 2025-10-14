import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Mail, Linkedin, Coffee, Briefcase, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { generateFollowUpEmail } from '@/services/ai-prep';
import Loader from '@/components/ui/Loader';

interface Company {
  id: string;
  company_name: string;
  conversation_summary?: string;
  follow_up_status: {
    thankYouSent?: boolean;
    applicationSubmitted?: boolean;
    linkedInConnected?: boolean;
    interviewScheduled?: boolean;
  };
  contact_info: {
    names?: string[];
    emails?: string[];
  };
}

export default function FollowUpsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [emailType, setEmailType] = useState<'linkedin' | 'coffee-chat' | 'internship'>('linkedin');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeSummary, setResumeSummary] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*, career_fair:career_fairs!inner(user_id)')
        .eq('career_fair.user_id', user.id)
        .order('created_at', { ascending: false });

      if (companiesError) throw companiesError;

      setCompanies(companiesData || []);

      // Load resume summary
      const { data: materialsData } = await supabase
        .from('user_materials')
        .select('resume_parsed')
        .eq('user_id', user.id)
        .single();

      if (materialsData?.resume_parsed) {
        setResumeSummary(materialsData.resume_parsed.summary || '');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!selectedCompany) return;

    if (!resumeSummary) {
      alert('Please upload your resume in the Materials tab first');
      return;
    }

    try {
      setIsGenerating(true);
      const recruiterName = selectedCompany.contact_info.names?.[0] || 'the recruiter';
      const email = await generateFollowUpEmail(
        emailType,
        selectedCompany.company_name,
        recruiterName,
        resumeSummary,
        selectedCompany.conversation_summary
      );
      setGeneratedEmail(email);
    } catch (error) {
      console.error('Error generating email:', error);
      alert('Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateFollowUpStatus = async (companyId: string, status: Partial<Company['follow_up_status']>) => {
    try {
      const company = companies.find(c => c.id === companyId);
      if (!company) return;

      const newStatus = { ...company.follow_up_status, ...status };

      const { error } = await supabase
        .from('companies')
        .update({ follow_up_status: newStatus })
        .eq('id', companyId);

      if (error) throw error;

      setCompanies(prev =>
        prev.map(c =>
          c.id === companyId
            ? { ...c, follow_up_status: newStatus }
            : c
        )
      );
    } catch (error) {
      console.error('Error updating follow-up status:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingFollowUps = companies.filter(
    c => !c.follow_up_status?.thankYouSent || !c.follow_up_status?.linkedInConnected
  );

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
        <h1 className="text-3xl font-bold tracking-tight">Follow-Ups</h1>
        <p className="text-muted-foreground mt-1">
          Track your next steps and generate personalized follow-up emails
        </p>
      </div>

      {/* Next Steps Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps Overview</CardTitle>
          <CardDescription>
            {pendingFollowUps.length} {pendingFollowUps.length === 1 ? 'company' : 'companies'} pending follow-up
          </CardDescription>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No companies yet</p>
              <Link to="/fairs">
                <Button>Go to Career Fairs</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {companies.map(company => (
                <div
                  key={company.id}
                  className="p-4 border border-border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{company.company_name}</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCompany(company)}
                    >
                      Generate Email
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={company.follow_up_status?.thankYouSent || false}
                        onChange={(e) =>
                          updateFollowUpStatus(company.id, { thankYouSent: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm">Thank-you sent</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={company.follow_up_status?.linkedInConnected || false}
                        onChange={(e) =>
                          updateFollowUpStatus(company.id, { linkedInConnected: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm">LinkedIn connected</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={company.follow_up_status?.applicationSubmitted || false}
                        onChange={(e) =>
                          updateFollowUpStatus(company.id, { applicationSubmitted: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm">Application submitted</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={company.follow_up_status?.interviewScheduled || false}
                        onChange={(e) =>
                          updateFollowUpStatus(company.id, { interviewScheduled: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm">Interview scheduled</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Generator */}
      {selectedCompany && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Follow-Up Email</CardTitle>
            <CardDescription>
              AI-powered personalized email for {selectedCompany.company_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Type</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={emailType === 'linkedin' ? 'default' : 'outline'}
                  onClick={() => setEmailType('linkedin')}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
                <Button
                  variant={emailType === 'coffee-chat' ? 'default' : 'outline'}
                  onClick={() => setEmailType('coffee-chat')}
                  className="flex items-center gap-2"
                >
                  <Coffee className="h-4 w-4" />
                  Coffee Chat
                </Button>
                <Button
                  variant={emailType === 'internship' ? 'default' : 'outline'}
                  onClick={() => setEmailType('internship')}
                  className="flex items-center gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  Internship
                </Button>
              </div>
            </div>

            <Button
              onClick={handleGenerateEmail}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Generate Email
                </>
              )}
            </Button>

            {generatedEmail && (
              <div className="space-y-3">
                <Textarea
                  value={generatedEmail}
                  onChange={(e) => setGeneratedEmail(e.target.value)}
                  rows={12}
                  className="resize-none font-mono text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
