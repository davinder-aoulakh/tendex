import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const DEFAULT_CRITERIA = [
  { id: 'price',       label: 'Price and value for money' },
  { id: 'experience',  label: 'Demonstrated experience in similar work' },
  { id: 'methodology', label: 'Quality of proposed approach or methodology' },
  { id: 'team',        label: 'Team capability and key personnel' },
  { id: 'timeline',    label: 'Ability to meet the timeline' },
  { id: 'values',      label: 'Alignment with our values or culture' },
];

export default function RFPEvaluationCriteria({ ranking, weightings, onChange }) {
  const [items, setItems] = useState(() => {
    if (ranking && ranking.length === DEFAULT_CRITERIA.length) {
      return ranking.map(id => DEFAULT_CRITERIA.find(c => c.id === id) || DEFAULT_CRITERIA[0]);
    }
    return [...DEFAULT_CRITERIA];
  });
  const [weights, setWeights] = useState(weightings || {});
  const [generating, setGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [weightError, setWeightError] = useState(false);

  const total = Object.values(weights).reduce((sum, v) => sum + (parseInt(v) || 0), 0);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setItems(reordered);
    onChange({ ranking: reordered.map(i => i.id), weightings: weights });
  };

  const handleWeightChange = (id, val) => {
    const next = { ...weights, [id]: val };
    setWeights(next);
    const tot = Object.values(next).reduce((s, v) => s + (parseInt(v) || 0), 0);
    setWeightError(tot !== 100);
    onChange({ ranking: items.map(i => i.id), weightings: next });
  };

  const generateWeightings = async () => {
    setGenerating(true);
    const rankList = items.map((item, idx) => `${idx + 1}. ${item.label}`).join('\n');
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a procurement advisor. A buyer has ranked their supplier evaluation criteria in order of importance:
${rankList}

Suggest percentage weightings for each criterion that:
- Add up to exactly 100%
- Reflect the ranking (higher rank = higher weight)
- Are reasonable for a formal procurement evaluation

Return JSON with criterion IDs as keys: price, experience, methodology, team, timeline, values`,
      response_json_schema: {
        type: 'object',
        properties: {
          price: { type: 'number' },
          experience: { type: 'number' },
          methodology: { type: 'number' },
          team: { type: 'number' },
          timeline: { type: 'number' },
          values: { type: 'number' },
        },
      },
    });
    if (result && typeof result === 'object') {
      const strWeights = Object.fromEntries(Object.entries(result).map(([k, v]) => [k, String(Math.round(v))]));
      setWeights(strWeights);
      setAiGenerated(true);
      setWeightError(false);
      onChange({ ranking: items.map(i => i.id), weightings: strWeights });
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Drag-and-drop ranking */}
      <div>
        <p className="text-sm text-blue-200/60 mb-3">Drag to rank from most important (top) to least important (bottom).</p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="criteria">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                          snapshot.isDragging
                            ? 'border-blue-400/60 shadow-lg shadow-blue-500/20'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                        style={{
                          background: snapshot.isDragging ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div {...provided.dragHandleProps} className="text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <span className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-sm text-white/90">{item.label}</span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* AI Weighting */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-blue-100/80">Evaluation Weightings</p>
          <Button
            type="button"
            size="sm"
            onClick={generateWeightings}
            disabled={generating}
            className="gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
            variant="ghost"
          >
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {aiGenerated ? 'Regenerate' : 'AI Suggest Weightings'}
          </Button>
        </div>

        {Object.keys(weights).length === 0 && !generating && (
          <p className="text-xs text-blue-200/40 italic mb-3">Click "AI Suggest Weightings" to generate based on your ranking, then adjust as needed.</p>
        )}

        {(Object.keys(weights).length > 0 || generating) && (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-sm text-white/70 flex-1">{item.label}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights[item.id] || ''}
                    onChange={e => handleWeightChange(item.id, e.target.value)}
                    className="w-16 text-center text-sm font-semibold text-white bg-white/10 border border-white/20 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400/60"
                    placeholder="0"
                  />
                  <span className="text-sm text-blue-200/50 w-4">%</span>
                </div>
              </div>
            ))}

            <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg border mt-2 ${
              total === 100
                ? 'border-green-400/30 bg-green-500/5'
                : 'border-red-400/30 bg-red-500/5'
            }`}>
              <span className="text-sm font-semibold text-white/70">Total</span>
              <span className={`text-sm font-bold ${total === 100 ? 'text-green-400' : 'text-red-400'}`}>
                {total}%
              </span>
            </div>

            {weightError && (
              <div className="flex items-center gap-2 text-xs text-red-400 px-1">
                <AlertCircle className="w-3 h-3" /> Weightings must add up to exactly 100%.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}