import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Plus, Calendar, MapPin, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CareerFair } from '@/types';

export default function CareerFairsPage() {
  const { careerFairs, loadCareerFairs, saveCareerFair, deleteCareerFair } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    loadCareerFairs();
  }, [loadCareerFairs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newFair: CareerFair = {
      id: crypto.randomUUID(),
      name: formData.name,
      date: new Date(formData.date),
      location: formData.location,
      notes: formData.notes || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await saveCareerFair(newFair);
    setFormData({ name: '', date: '', location: '', notes: '' });
    setShowForm(false);
  };

  const handleDelete = async (e: React.MouseEvent, fairId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this career fair? This will also delete all associated companies and checklist items.')) {
      await deleteCareerFair(fairId);
    }
  };

  const upcomingFairs = careerFairs.filter(fair => new Date(fair.date) >= new Date());
  const pastFairs = careerFairs.filter(fair => new Date(fair.date) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Fairs</h1>
          <p className="text-muted-foreground mt-1">Manage your career fair events</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Fair'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Career Fair</CardTitle>
            <CardDescription>Add details about the upcoming event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Fair Name</label>
                <Input
                  required
                  placeholder="Spring 2025 Career Fair"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  required
                  placeholder="Student Union Building"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Input
                  placeholder="Dress code, parking info, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Create Career Fair</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {upcomingFairs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingFairs.map(fair => (
              <Link key={fair.id} to={`/fairs/${fair.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(e, fair.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardHeader>
                    <CardTitle>{fair.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(fair.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {fair.location}
                      </div>
                    </div>
                  </CardHeader>
                  {fair.notes && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{fair.notes}</p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pastFairs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Events</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastFairs.map(fair => (
              <Link key={fair.id} to={`/fairs/${fair.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-75 relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(e, fair.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardHeader>
                    <CardTitle>{fair.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(fair.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {fair.location}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {careerFairs.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No career fairs yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first career fair to get started
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Create Career Fair
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
