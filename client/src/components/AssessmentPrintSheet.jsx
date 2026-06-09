import { useMemo } from 'react';
import {
  getFilledChecklistEntries,
  getFilledFlowStepSections,
  getPrescriptionNotes,
  getPrintDoctorHeader,
} from '../utils/assessmentPrintHelpers';

export default function AssessmentPrintSheet({
  patientName,
  patientAge,
  diseaseName,
  checklist,
  investigation,
  prescription,
  flow,
}) {
  const checklistEntries = useMemo(() => getFilledChecklistEntries(checklist), [checklist]);
  const investigationBlocks = useMemo(
    () => getFilledFlowStepSections(flow, 'investigation', investigation),
    [flow, investigation],
  );
  const prescriptionText = useMemo(() => getPrescriptionNotes(prescription), [prescription]);
  const printDoctor = useMemo(
    () => getPrintDoctorHeader(investigation, prescription),
    [investigation, prescription],
  );
  const qualificationLines = useMemo(() => {
    if (!printDoctor.qualifications) return [];
    return printDoctor.qualifications
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
  }, [printDoctor]);

  const investigationTitle =
    flow?.pageTitle?.investigation?.split('\n')[0] || 'Investigation';

  return (
    <div className="management-print-sheet" aria-hidden="true">
      <header className="print-sheet-top">
        <div className="print-sheet-brand">
          <img src="/logo.png" alt="ALCODS" className="print-sheet-logo-alcods" />
        </div>
        <div className="print-sheet-doctor-slot">
          <div className="print-sheet-doctor-custom">
            {printDoctor.name && (
              <div className="print-sheet-doctor-name">{printDoctor.name}</div>
            )}
            {qualificationLines.map((line, i) => (
              <div key={`qual-${i}`} className="print-sheet-doctor-qual">{line}</div>
            ))}
          </div>
        </div>
      </header>

      <div className="print-sheet-columns">
        <div className="print-sheet-col-left">
          <section className="print-sheet-section print-sheet-patient-checklist">
            <h2 className="print-sheet-heading">Patient &amp; vitals</h2>
            <dl className="print-sheet-dl print-sheet-dl-inline">
              <dt>Name</dt>
              <dd>{patientName || '—'}</dd>
              <dt>Age</dt>
              <dd>{patientAge != null ? patientAge : '—'}</dd>
              <dt>Disease</dt>
              <dd>{diseaseName || '—'}</dd>
            </dl>

            {checklistEntries.length > 0 && (
              <>
                <h3 className="print-sheet-subheading">Basic checklist</h3>
                <ul className="print-sheet-list">
                  {checklistEntries.map((row) => (
                    <li key={`${row.label}-${row.value}`}>
                      <strong>{row.label}:</strong> {row.value}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {investigationBlocks.length > 0 && (
            <section className="print-sheet-section print-sheet-section-spaced">
              <h2 className="print-sheet-heading">{investigationTitle}</h2>
              {investigationBlocks.map((block, bi) => (
                <div key={`i-${bi}`} className="print-sheet-block">
                  <h3 className="print-sheet-subheading">{block.heading}</h3>
                  <ul className="print-sheet-list">
                    {block.lines.map((line, li) => (
                      <li key={`i-${bi}-${li}`}>{line.text}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}
        </div>

        <div className="print-sheet-col-right">
          <section className="print-sheet-section print-sheet-prescription">
            <h2 className="print-sheet-heading">Prescription</h2>
            <div className="print-sheet-prescription-body">
              {prescriptionText.trim() ? (
                <pre className="print-sheet-prescription-pre">{prescriptionText}</pre>
              ) : (
                <p className="print-sheet-empty-muted">—</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
