import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, MapPin, Calendar, ExternalLink, Mail, Phone, CheckCircle, Circle, Mic, Square, Play, Trash2, Save } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Loader from '@/components/ui/Loader';

export default function CompanyDetailPage() {
  const { fairId, companyId } = useParams<{ fairId: string; companyId: string }>();
  const navigate = useNavigate();
  const { currentCompany, loadCompany, saveCompany } = useStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [textNotes, setTextNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (companyId) {
      loadCompany(companyId);
    }
  }, [companyId, loadCompany]);

  useEffect(() => {
    if (currentCompany) {
      setTextNotes(currentCompany.conversationSummary || '');
    }
  }, [currentCompany]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;

          const newVoiceNote = {
            id: crypto.randomUUID(),
            audioBlob: base64Audio,
            duration: recordingTime,
            createdAt: new Date(),
          };

          const updated = {
            ...currentCompany!,
            voiceNotes: [...(currentCompany!.voiceNotes || []), newVoiceNote],
            updatedAt: new Date()
          };

          await saveCompany(updated);
          loadCompany(companyId!);
        };

        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playVoiceNote = (audioBlob: string) => {
    const audio = new Audio(audioBlob);
    audio.play();
  };

  const deleteVoiceNote = async (noteId: string) => {
    if (!currentCompany) return;

    const updated = {
      ...currentCompany,
      voiceNotes: currentCompany.voiceNotes?.filter(note => note.id !== noteId),
      updatedAt: new Date()
    };

    await saveCompany(updated);
    loadCompany(companyId!);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveTextNotes = async () => {
    if (!currentCompany) return;

    setIsSavingNotes(true);
    try {
      const updated = {
        ...currentCompany,
        conversationSummary: textNotes,
        updatedAt: new Date()
      };

      await saveCompany(updated);
      await loadCompany(companyId!);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/fairs/${fairId}/companies`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{currentCompany.companyName}</h1>
          {currentCompany.boothNumber && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Booth {currentCompany.boothNumber}
            </p>
          )}
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentCompany.priority === 'high'
              ? 'bg-red-100 text-red-700'
              : currentCompany.priority === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {currentCompany.priority}
        </div>
      </div>

      {currentCompany.positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentCompany.positions.map((position, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {position}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {(currentCompany.contactInfo.names.length > 0 ||
        currentCompany.contactInfo.emails.length > 0 ||
        currentCompany.contactInfo.phones.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentCompany.contactInfo.names.map((name, index) => (
              <div key={index} className="text-sm">{name}</div>
            ))}
            {currentCompany.contactInfo.emails.map((email, index) => (
              <a
                key={index}
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {email}
              </a>
            ))}
            {currentCompany.contactInfo.phones.map((phone, index) => (
              <a
                key={index}
                href={`tel:${phone}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                {phone}
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {currentCompany.applicationDeadline && (
        <Card>
          <CardHeader>
            <CardTitle>Application Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-destructive" />
              {formatDate(currentCompany.applicationDeadline)}
            </div>
          </CardContent>
        </Card>
      )}

      {(currentCompany.websiteUrl || currentCompany.careersPageUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentCompany.websiteUrl && (
              <a
                href={currentCompany.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Company Website
              </a>
            )}
            {currentCompany.careersPageUrl && (
              <a
                href={currentCompany.careersPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Careers Page
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {currentCompany.userNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{currentCompany.userNotes}</p>
          </CardContent>
        </Card>
      )}

      {currentCompany.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentCompany.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5" />
                  {req}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Scanned Images */}
      {currentCompany.scannedImages && currentCompany.scannedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scanned Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentCompany.scannedImages.map((image, index) => (
                <div key={index} className="relative rounded-xl overflow-hidden border-2 border-border shadow-soft">
                  <img
                    src={image}
                    alt={`Scanned document ${index + 1}`}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Voice Notes</CardTitle>
            {!isRecording && (
              <Button onClick={startRecording} size="sm" className="gap-2">
                <Mic className="h-4 w-4" />
                Record
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRecording && (
            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-xl border-2 border-destructive animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                <span className="font-semibold text-destructive">Recording... {formatDuration(recordingTime)}</span>
              </div>
              <Button onClick={stopRecording} size="sm" variant="destructive" className="gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </div>
          )}

          {currentCompany.voiceNotes && currentCompany.voiceNotes.length > 0 ? (
            <div className="space-y-3">
              {currentCompany.voiceNotes.map((note) => (
                <div key={note.id} className="flex items-center justify-between p-4 bg-accent/20 rounded-xl border">
                  <div className="flex items-center gap-3 flex-1">
                    <Button onClick={() => playVoiceNote(note.audioBlob)} size="icon" variant="ghost">
                      <Play className="h-4 w-4" />
                    </Button>
                    <div>
                      <div className="text-sm font-medium">{formatDuration(note.duration)}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</div>
                    </div>
                  </div>
                  <Button onClick={() => deleteVoiceNote(note.id)} size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : !isRecording && (
            <p className="text-sm text-muted-foreground text-center py-4">No voice notes yet. Tap Record to add one.</p>
          )}
        </CardContent>
      </Card>

      {/* Text Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Additional Notes</CardTitle>
            <Button onClick={saveTextNotes} size="sm" disabled={isSavingNotes} className="gap-2">
              <Save className="h-4 w-4" />
              {isSavingNotes ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={textNotes}
            onChange={(e) => setTextNotes(e.target.value)}
            placeholder="Add conversation notes, impressions, next steps, or any other details about your interaction with this company..."
            className="min-h-[200px]"
            rows={8}
          />
          <p className="text-xs text-muted-foreground mt-2">
            These notes are private and only visible to you
          </p>
        </CardContent>
      </Card>

      {/* Follow-up Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FollowUpItem
            label="Send thank-you email"
            checked={currentCompany.followUpStatus.thankYouSent}
            date={currentCompany.followUpStatus.thankYouSentDate}
            onToggle={async () => {
              const updated = {
                ...currentCompany,
                followUpStatus: {
                  ...currentCompany.followUpStatus,
                  thankYouSent: !currentCompany.followUpStatus.thankYouSent,
                  thankYouSentDate: !currentCompany.followUpStatus.thankYouSent ? new Date() : undefined
                },
                updatedAt: new Date()
              };
              await saveCompany(updated);
              loadCompany(companyId!);
            }}
          />
          <FollowUpItem
            label="Submit application"
            checked={currentCompany.followUpStatus.applicationSubmitted}
            date={currentCompany.followUpStatus.applicationSubmittedDate}
            onToggle={async () => {
              const updated = {
                ...currentCompany,
                followUpStatus: {
                  ...currentCompany.followUpStatus,
                  applicationSubmitted: !currentCompany.followUpStatus.applicationSubmitted,
                  applicationSubmittedDate: !currentCompany.followUpStatus.applicationSubmitted ? new Date() : undefined
                },
                updatedAt: new Date()
              };
              await saveCompany(updated);
              loadCompany(companyId!);
            }}
          />
          <FollowUpItem
            label="Connect on LinkedIn"
            checked={currentCompany.followUpStatus.linkedInConnected}
            date={currentCompany.followUpStatus.linkedInConnectedDate}
            onToggle={async () => {
              const updated = {
                ...currentCompany,
                followUpStatus: {
                  ...currentCompany.followUpStatus,
                  linkedInConnected: !currentCompany.followUpStatus.linkedInConnected,
                  linkedInConnectedDate: !currentCompany.followUpStatus.linkedInConnected ? new Date() : undefined
                },
                updatedAt: new Date()
              };
              await saveCompany(updated);
              loadCompany(companyId!);
            }}
          />
          <FollowUpItem
            label="Interview scheduled"
            checked={currentCompany.followUpStatus.interviewScheduled}
            date={currentCompany.followUpStatus.interviewDate}
            onToggle={async () => {
              const updated = {
                ...currentCompany,
                followUpStatus: {
                  ...currentCompany.followUpStatus,
                  interviewScheduled: !currentCompany.followUpStatus.interviewScheduled,
                  interviewDate: !currentCompany.followUpStatus.interviewScheduled ? new Date() : undefined
                },
                updatedAt: new Date()
              };
              await saveCompany(updated);
              loadCompany(companyId!);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function FollowUpItem({
  label,
  checked,
  date,
  onToggle
}: {
  label: string;
  checked: boolean;
  date?: Date;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-start gap-3 w-full p-3 rounded-lg border hover:bg-accent transition-colors text-left"
    >
      <div className="mt-0.5 text-primary">
        {checked ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <div className={`text-sm font-medium ${checked ? 'line-through text-muted-foreground' : ''}`}>
          {label}
        </div>
        {date && (
          <div className="text-xs text-muted-foreground mt-1">
            {formatDate(date)}
          </div>
        )}
      </div>
    </button>
  );
}
