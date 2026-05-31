import { getDiabetesIntensiveGuidanceBlocks } from '../utils/diabetesIntensiveTreatmentPlan';

export default function DiabetesIntensiveTreatmentPlan({
  patientAge,
  checklistRow,
  history,
  treatmentPlan,
  setTreatmentPlan,
}) {
  const blocks = getDiabetesIntensiveGuidanceBlocks(patientAge, checklistRow, history);

  return (
    <>
      {blocks.map((block) => (
        <div key={block.noteKey} className="diabetes-guidance-section">
          <h3 className="section-title">{block.sectionTitle}</h3>
          <div className="diabetes-guidance-card" role="region" aria-label={block.card.title}>
            <h4 className="diabetes-guidance-card-title">{block.card.title}</h4>
            <ul className="diabetes-guidance-card-list">
              {block.card.bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="diabetes-guidance-notes-wrap">
            <label className="diabetes-guidance-notes-label" htmlFor={block.noteKey}>
              Additional notes
            </label>
            <textarea
              id={block.noteKey}
              rows={4}
              className="diabetes-guidance-notes"
              value={treatmentPlan[block.noteKey] || ''}
              onChange={(e) =>
                setTreatmentPlan((tp) => ({ ...tp, [block.noteKey]: e.target.value }))
              }
              placeholder="Type any patient-specific additions…"
            />
          </div>
        </div>
      ))}
    </>
  );
}
