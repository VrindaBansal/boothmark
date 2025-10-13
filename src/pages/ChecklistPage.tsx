import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { DEFAULT_CHECKLIST_ITEMS, PrepChecklistItem } from '@/types';

export default function ChecklistPage() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { checklistItems, loadChecklistItems, saveChecklistItem, toggleChecklistItem, deleteChecklistItem, currentFair, loadCareerFair } = useStore();
  const [newItemText, setNewItemText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (fairId) {
      loadCareerFair(fairId);
      loadChecklistItems(fairId);
    }
  }, [fairId, loadCareerFair, loadChecklistItems]);

  useEffect(() => {
    // Only initialize default items once when checklist is empty
    if (fairId && checklistItems.length === 0) {
      const initializeItems = async () => {
        const items = await loadChecklistItems(fairId);
        if (items.length === 0) {
          await initializeDefaultItems();
        }
      };
      initializeItems();
    }
  }, [fairId]);

  const initializeDefaultItems = async () => {
    if (!fairId) return;

    for (let i = 0; i < DEFAULT_CHECKLIST_ITEMS.length; i++) {
      const item: PrepChecklistItem = {
        id: crypto.randomUUID(),
        careerFairId: fairId,
        text: DEFAULT_CHECKLIST_ITEMS[i],
        isCompleted: false,
        isDefault: true,
        order: i,
        createdAt: new Date()
      };
      await saveChecklistItem(item);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || !fairId) return;

    const newItem: PrepChecklistItem = {
      id: crypto.randomUUID(),
      careerFairId: fairId,
      text: newItemText.trim(),
      isCompleted: false,
      isDefault: false,
      order: checklistItems.length,
      createdAt: new Date()
    };

    await saveChecklistItem(newItem);
    setNewItemText('');
    setShowAddForm(false);
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteChecklistItem(itemId);
    }
  };

  const completedCount = checklistItems.filter(item => item.isCompleted).length;
  const totalCount = checklistItems.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/fairs/${fairId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Prep Checklist</h1>
          {currentFair && (
            <p className="text-sm text-muted-foreground">{currentFair.name}</p>
          )}
        </div>
      </div>

      {totalCount > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedCount} of {totalCount} completed
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center mt-2 text-2xl font-bold text-primary">
              {progress}%
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {checklistItems
          .sort((a, b) => a.order - b.order)
          .map(item => (
            <Card
              key={item.id}
              className={`transition-all ${item.isCompleted ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className="mt-0.5 flex-shrink-0 text-primary hover:text-primary/80 transition-colors"
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        item.isCompleted ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {item.text}
                    </p>
                    {item.completedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed {new Date(item.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {!item.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Custom Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4">
              <Input
                placeholder="E.g., Research target companies"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Add Item</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItemText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setShowAddForm(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4" />
          Add Custom Item
        </Button>
      )}

      {checklistItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading checklist...</h3>
            <p className="text-muted-foreground">
              Default preparation items will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
