import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Camera, FileText, CheckSquare, Building2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CareerFairDetailPage() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { currentFair, loadCareerFair, companies, loadCompanies } = useStore();

  useEffect(() => {
    if (fairId) {
      loadCareerFair(fairId);
      loadCompanies(fairId);
    }
  }, [fairId, loadCareerFair, loadCompanies]);

  if (!currentFair) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/fairs')}>
        <ArrowLeft className="h-4 w-4" />
        Back to Fairs
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{currentFair.name}</h1>
        <p className="text-muted-foreground mt-1">
          {formatDate(currentFair.date)} • {currentFair.location}
        </p>
        {currentFair.notes && (
          <p className="text-sm text-muted-foreground mt-2">{currentFair.notes}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to={`/fairs/${fairId}/companies`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>Companies</CardTitle>
              </div>
              <CardDescription>
                {companies.length} {companies.length === 1 ? 'company' : 'companies'} tracked
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to={`/fairs/${fairId}/scan`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <CardTitle>Scan Document</CardTitle>
              </div>
              <CardDescription>Add company by scanning flyer</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to={`/fairs/${fairId}/checklist`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <CardTitle>Prep Checklist</CardTitle>
              </div>
              <CardDescription>Get ready for the event</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card className="opacity-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Follow-up Tasks</CardTitle>
            </div>
            <CardDescription>Coming soon</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {companies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
            <CardDescription>Last 5 companies you've added</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {companies.slice(0, 5).map(company => (
              <Link
                key={company.id}
                to={`/fairs/${fairId}/companies/${company.id}`}
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{company.companyName}</div>
                    <div className="text-sm text-muted-foreground">
                      {company.positions.length > 0 && company.positions[0]}
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
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
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
