import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Plus, Search, Camera, Building2, Download } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { exportToCSV } from '@/services/export';

export default function CompaniesPage() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { companies, loadCompanies, currentFair, loadCareerFair } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (fairId) {
      loadCareerFair(fairId);
      loadCompanies(fairId);
    }
  }, [fairId, loadCareerFair, loadCompanies]);

  const filteredCompanies = companies
    .filter(company => {
      const matchesSearch =
        company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.positions.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
        company.userNotes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || company.priority === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/fairs/${fairId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          {currentFair && (
            <p className="text-sm text-muted-foreground">{currentFair.name}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => navigate(`/fairs/${fairId}/scan`)} className="flex-1">
          <Camera className="h-4 w-4" />
          Scan Flyer
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex-1"
        >
          <Plus className="h-4 w-4" />
          Add Manually
        </Button>
      </div>

      {companies.length > 0 && (
        <Button
          variant="outline"
          onClick={() => exportToCSV(companies, currentFair?.name || 'Career Fair')}
          className="w-full"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      )}

      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <ManualCompanyForm
              fairId={fairId!}
              onComplete={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map(priority => (
            <Button
              key={priority}
              variant={filter === priority ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(priority)}
            >
              {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filteredCompanies.length > 0 ? (
        <div className="space-y-3">
          {filteredCompanies.map(company => (
            <Link
              key={company.id}
              to={`/fairs/${fairId}/companies/${company.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{company.companyName}</div>
                      {company.boothNumber && (
                        <div className="text-sm text-muted-foreground">
                          Booth {company.boothNumber}
                        </div>
                      )}
                      {company.positions.length > 0 && (
                        <div className="text-sm mt-1">
                          {company.positions.slice(0, 2).join(', ')}
                          {company.positions.length > 2 && ` +${company.positions.length - 2} more`}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        {formatDateTime(company.createdAt)}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        company.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : company.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {company.priority}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by scanning a company flyer or adding one manually
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ManualCompanyForm({ fairId, onComplete }: { fairId: string; onComplete: () => void }) {
  const { saveCompany } = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    boothNumber: '',
    position: '',
    notes: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newCompany = {
      id: crypto.randomUUID(),
      careerFairId: fairId,
      companyName: formData.companyName,
      boothNumber: formData.boothNumber || undefined,
      positions: formData.position ? [formData.position] : [],
      contactInfo: { names: [], emails: [], phones: [] },
      requirements: [],
      userNotes: formData.notes,
      actionItems: [],
      priority: formData.priority,
      tags: [],
      scannedImages: [],
      extractionMethod: 'manual' as const,
      followUpStatus: {
        thankYouSent: false,
        applicationSubmitted: false,
        linkedInConnected: false,
        interviewScheduled: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await saveCompany(newCompany);
    onComplete();
    navigate(`/fairs/${fairId}/companies/${newCompany.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Company Name *</label>
        <Input
          required
          placeholder="Acme Corp"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Booth Number</label>
        <Input
          placeholder="A-123"
          value={formData.boothNumber}
          onChange={(e) => setFormData({ ...formData, boothNumber: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Position</label>
        <Input
          placeholder="Software Engineer"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Priority</label>
        <div className="flex gap-2 mt-1">
          {(['high', 'medium', 'low'] as const).map(priority => (
            <Button
              key={priority}
              type="button"
              variant={formData.priority === priority ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFormData({ ...formData, priority })}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          placeholder="Initial impressions, conversation notes, key points discussed..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="min-h-[180px]"
          rows={6}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">Add Company</Button>
        <Button type="button" variant="outline" onClick={onComplete}>Cancel</Button>
      </div>
    </form>
  );
}
