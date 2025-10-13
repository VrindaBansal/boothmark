import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ArrowLeft, Camera, Upload, CheckCircle, AlertCircle, X, QrCode } from 'lucide-react';
import { processImageWithOCR, compressImage } from '@/services/ocr';
import { processImageWithGPT4o, generateAISummary } from '@/services/gpt4o';
import { extractFromPDF, isPDF } from '@/services/pdf';
import { Company } from '@/types';
import { Html5Qrcode } from 'html5-qrcode';
import Loader from '@/components/ui/Loader';

export default function ScanPage() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { saveCompany, settings } = useStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrData, setQrData] = useState<{ url: string; content: string } | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
      stopQRScanner();
    };
  }, []);

  const startQRScanner = async () => {
    try {
      setError(null);
      setShowQRScanner(true);

      // Wait for DOM to render
      await new Promise(resolve => setTimeout(resolve, 100));

      const qrScanner = new Html5Qrcode('qr-reader');
      qrScannerRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Successfully scanned QR code
          const isUrl = decodedText.startsWith('http://') || decodedText.startsWith('https://');
          setQrData({
            url: isUrl ? decodedText : '',
            content: decodedText
          });
          stopQRScanner();
        },
        () => {
          // Error while scanning - ignore, this fires often
        }
      );
    } catch (err) {
      setError('Failed to start QR scanner. Please check permissions.');
      console.error('QR Scanner error:', err);
      setShowQRScanner(false);
    }
  };

  const stopQRScanner = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
        qrScannerRef.current.clear();
        qrScannerRef.current = null;
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
      }
    }
    setShowQRScanner(false);
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    stopCamera();

    // Automatically start processing
    setTimeout(() => processImage(imageData), 100);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a PDF
    if (isPDF(file)) {
      await processPDF(file);
      return;
    }

    // Handle image upload
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setCapturedImage(imageData);
      // Automatically start processing
      setTimeout(() => processImage(imageData), 100);
    };
    reader.readAsDataURL(file);
  };

  const processPDF = async (file: File) => {
    if (!fairId) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Extract text and images from PDF
      const pdfData = await extractFromPDF(file, setProgress);

      // Use the first page image as the captured image
      if (pdfData.images.length > 0) {
        setCapturedImage(pdfData.images[0]);
      }

      // Process the extracted text with OCR or GPT-4o
      let result;
      if (settings?.openAIApiKey) {
        // Use GPT-4o with the first page image and extracted text
        const imageToProcess = pdfData.images[0] || '';
        result = await processImageWithGPT4o(imageToProcess, settings.openAIApiKey, pdfData.text);
      } else {
        // Parse the extracted text for company info
        result = parseExtractedText(pdfData.text);
      }

      setExtractedData({
        ...result,
        rawText: pdfData.text,
        pdfPages: pdfData.numPages,
        allImages: pdfData.images,
      });

      // Generate AI summary for PDF
      setIsGeneratingSummary(true);
      try {
        const imageToProcess = pdfData.images[0] || '';
        const summary = await generateAISummary(imageToProcess, pdfData.text);
        setAiSummary(summary);
      } catch (summaryErr) {
        console.error('Failed to generate AI summary:', summaryErr);
      } finally {
        setIsGeneratingSummary(false);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to process PDF');
      console.error('PDF processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseExtractedText = (text: string) => {
    // Basic text parsing for company information
    const lines = text.split('\n').filter(line => line.trim());

    // Extract emails
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = text.match(emailRegex) || [];

    // Extract phone numbers
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = text.match(phoneRegex) || [];

    // Extract URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];

    // Try to find company name (usually in first few lines, often capitalized)
    const companyName = lines.slice(0, 5).find(line =>
      line.length > 3 && line.length < 50 && /[A-Z]/.test(line)
    ) || '';

    return {
      companyName: companyName.trim(),
      boothNumber: '',
      positions: [],
      contactInfo: {
        emails: [...new Set(emails)],
        phones: [...new Set(phones)],
      },
      deadline: '',
      requirements: '',
      websiteUrl: urls[0] || '',
      careersPageUrl: urls.find(url => url.toLowerCase().includes('career')) || '',
      confidence: 60, // Lower confidence for basic text parsing
      rawText: text,
    };
  };

  const processImage = async (imageData?: string) => {
    const imgData = imageData || capturedImage;
    if (!imgData || !fairId) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Compress image
      const compressedImage = await compressImage(imgData, 1024);

      let result;
      // Check if OpenAI key is available, otherwise use OCR
      if (settings?.openAIApiKey) {
        setProgress(50);
        result = await processImageWithGPT4o(compressedImage, settings.openAIApiKey);
        setProgress(100);
      } else {
        result = await processImageWithOCR(compressedImage, setProgress);
      }

      setExtractedData(result);

      // Generate AI summary after extraction
      setIsGeneratingSummary(true);
      try {
        const summary = await generateAISummary(compressedImage, result.rawText);
        setAiSummary(summary);
      } catch (summaryErr) {
        console.error('Failed to generate AI summary:', summaryErr);
        // Don't fail the entire process if summary fails
      } finally {
        setIsGeneratingSummary(false);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to process image');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveExtractedCompany = async () => {
    if (!extractedData || !fairId) return;

    const newCompany: Company = {
      id: crypto.randomUUID(),
      careerFairId: fairId,
      companyName: extractedData.companyName,
      boothNumber: extractedData.boothNumber,
      positions: extractedData.positions,
      contactInfo: extractedData.contactInfo,
      applicationDeadline: extractedData.deadline,
      requirements: extractedData.requirements,
      websiteUrl: extractedData.websiteUrl,
      careersPageUrl: extractedData.careersPageUrl,
      userNotes: '',
      conversationSummary: aiSummary, // Save AI summary
      actionItems: [],
      priority: 'medium',
      tags: [],
      scannedImages: [capturedImage!], // Save the captured/uploaded image
      extractionMethod: settings?.openAIApiKey ? 'gpt4o' : 'ocr',
      extractionConfidence: extractedData.confidence,
      rawExtractedText: extractedData.rawText,
      followUpStatus: {
        thankYouSent: false,
        applicationSubmitted: false,
        linkedInConnected: false,
        interviewScheduled: false
      },
      voiceNotes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await saveCompany(newCompany);
    navigate(`/fairs/${fairId}/companies/${newCompany.id}`);
  };

  const reset = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setError(null);
    setProgress(0);
    stopCamera();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/fairs/${fairId}/companies`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Scan Document</h1>
          <p className="text-sm text-muted-foreground">
            Using GPT-4o-mini Vision
          </p>
        </div>
      </div>

      {/* Camera View - Full Screen Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black animate-fade-in">
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Camera Controls Overlay */}
            <div className="absolute inset-0 flex flex-col">
              {/* Top Bar */}
              <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopCamera}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
                <div className="text-white text-sm font-medium">Position document in frame</div>
                <div className="w-10" />
              </div>

              {/* Center Frame Guide */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="relative w-full max-w-lg aspect-[3/4]">
                  {/* Corner Brackets */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary rounded-br-xl" />
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="flex justify-center items-center p-8 bg-gradient-to-t from-black/50 to-transparent">
                <Button
                  size="lg"
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full bg-white hover:bg-white/90 shadow-soft-lg relative animate-scale-in"
                >
                  <div className="absolute inset-2 rounded-full border-4 border-primary" />
                  <Camera className="h-8 w-8 text-primary" />
                </Button>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      {/* QR Scanner View */}
      {showQRScanner && (
        <div className="fixed inset-0 z-50 bg-black animate-fade-in">
          <div className="relative w-full h-full">
            {/* QR Scanner Container */}
            <div id="qr-reader" className="w-full h-full" />

            {/* Controls Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopQRScanner}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
                <div className="text-white text-sm font-medium">Scan QR Code</div>
                <div className="w-10" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Data Display */}
      {qrData && !isProcessing && (
        <Card className="shadow-soft-lg animate-scale-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                QR Code Scanned
              </CardTitle>
            </div>
            <CardDescription>Review the scanned QR code data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">Content</label>
              <div className="p-4 bg-secondary rounded-xl text-sm break-all">{qrData.content}</div>
            </div>

            {qrData.url && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">URL</label>
                <a
                  href={qrData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm break-all"
                >
                  {qrData.url}
                </a>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={() => {
                // Save QR data as notes in extracted data
                setExtractedData({
                  companyName: '',
                  boothNumber: '',
                  positions: [],
                  contactInfo: { emails: [], phones: [] },
                  deadline: '',
                  requirements: '',
                  websiteUrl: qrData.url || '',
                  careersPageUrl: '',
                  confidence: 100,
                  rawText: `QR Code: ${qrData.content}`,
                });
                setQrData(null);
              }} className="flex-1 shadow-soft hover:shadow-soft-lg">
                <CheckCircle className="h-5 w-5" />
                Save QR Data
              </Button>
              <Button onClick={() => setQrData(null)} variant="outline">Scan Another</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capture Options */}
      {!capturedImage && !showCamera && !showQRScanner && !qrData && !isProcessing && (
        <div className="grid gap-4 sm:grid-cols-3 animate-scale-in">
          <Card
            className="hover-lift shadow-soft cursor-pointer border-2 hover:border-primary/50"
            onClick={startCamera}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Use Camera</h3>
              <p className="text-sm text-muted-foreground">Take a photo of the document</p>
            </CardContent>
          </Card>

          <Card
            className="hover-lift shadow-soft cursor-pointer border-2 hover:border-primary/50"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Upload</h3>
              <p className="text-sm text-muted-foreground">Choose image or PDF</p>
            </CardContent>
          </Card>

          <Card
            className="hover-lift shadow-soft cursor-pointer border-2 hover:border-primary/50"
            onClick={startQRScanner}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zomp/30 to-zomp/10 flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-zomp" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Scan QR Code</h3>
              <p className="text-sm text-muted-foreground">Scan company QR code</p>
            </CardContent>
          </Card>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Processing */}
      {capturedImage && isProcessing && (
        <Card className="shadow-soft-lg animate-scale-in">
          <CardContent className="p-8 space-y-6">
            <img src={capturedImage} alt="Captured" className="w-full rounded-xl shadow-soft" />
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader />
                <span className="font-semibold text-foreground">Processing image ({progress}%)...</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {settings?.openAIApiKey
                  ? 'Using AI to extract information...'
                  : 'Using OCR to extract text...'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive shadow-soft-lg animate-scale-in">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <span className="font-semibold">{error}</span>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => processImage()} className="flex-1">Try Again</Button>
              <Button onClick={reset} variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {extractedData && !isProcessing && (
        <Card className="shadow-soft-lg animate-scale-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Extraction Complete
              </CardTitle>
              <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                {extractedData.confidence}% confidence
              </div>
            </div>
            <CardDescription>Review and edit the extracted information below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* AI Summary */}
            {isGeneratingSummary && (
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-6 flex flex-col items-center gap-3">
                  <Loader />
                  <p className="text-sm text-muted-foreground">Generating AI summary...</p>
                </CardContent>
              </Card>
            )}

            {aiSummary && !isGeneratingSummary && (
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">Company Name</label>
              <Input
                value={extractedData.companyName}
                onChange={(e) => setExtractedData({ ...extractedData, companyName: e.target.value })}
              />
            </div>

            {extractedData.boothNumber && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">Booth Number</label>
                <Input
                  value={extractedData.boothNumber}
                  onChange={(e) => setExtractedData({ ...extractedData, boothNumber: e.target.value })}
                />
              </div>
            )}

            {extractedData.positions.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">Positions</label>
                <div className="space-y-2">
                  {extractedData.positions.map((pos: string, i: number) => (
                    <div key={i} className="px-4 py-3 bg-accent/10 rounded-xl text-sm font-medium border border-accent/20">
                      {pos}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extractedData.contactInfo.emails.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">Emails</label>
                <div className="space-y-2">
                  {extractedData.contactInfo.emails.map((email: string, i: number) => (
                    <div key={i} className="px-4 py-3 bg-secondary rounded-xl text-sm">
                      {email}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={saveExtractedCompany} className="flex-1 shadow-soft hover:shadow-soft-lg">
                <CheckCircle className="h-5 w-5" />
                Save Company
              </Button>
              <Button onClick={reset} variant="outline">Start Over</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
