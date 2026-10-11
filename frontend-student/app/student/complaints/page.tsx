'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAquaGuard } from '@/lib/store';
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react';

const COMMON_ISSUES = [
  'Bad smell',
  'Bad taste',
  'Discoloration',
  'Visible particles',
  'Low water pressure',
  'Other',
];

const STEPS = [
  { q: 'What did you notice?', hint: 'Pick everything that applies.' },
  { q: 'Where is it happening?', hint: 'So the team knows where to go.' },
  { q: 'Anything else we should know?', hint: 'When it started, how bad it looks.' },
];

const underlineField =
  'w-full border-0 border-b-2 border-blue-100 bg-transparent px-0 py-3 text-lg font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 transition focus:border-blue-600 focus:outline-none focus:ring-0';

/** A small tank that fills as the person moves through the steps */
function Tank({ percent }: { percent: number }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-blue-50 ring-2 ring-blue-200">
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-blue-600 to-sky-400 transition-all duration-700 ease-out"
        style={{ height: `${percent}%` }}
      >
        <div className="absolute inset-x-0 -top-1 h-2 rounded-[50%] bg-sky-300/80" />
      </div>
    </div>
  );
}

export default function StudentComplaintPage() {
  const router = useRouter();
  const { session, hostels, selectedHostelId, setSelectedHostelId, selectedHostel, selectedTank, addComplaint } = useAquaGuard();

  const [step, setStep] = useState(0);
  const [selectedIssues, setSelectedIssues] = useState<string[]>(['Bad smell']);
  const [description, setDescription] = useState('');
  const [roomNumber, setRoomNumber] = useState(session.room || 'Room 304');
  const [studentBlock, setStudentBlock] = useState(session.block || selectedHostel.blocks[0] || 'Block A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const lastStep = STEPS.length - 1;

  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const canAdvance =
    step === 0
      ? selectedIssues.length > 0
      : step === 1
      ? roomNumber.trim().length > 0
      : description.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enter key on an earlier step just moves forward
    if (step < lastStep) {
      if (canAdvance) setStep(step + 1);
      return;
    }

    if (selectedIssues.length === 0) {
      alert('Please select at least one observed issue.');
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    addComplaint({
      studentName: session.name || 'Student Resident',
      studentRoll: '2023UCO1542',
      block: `${selectedHostel.code} - ${studentBlock}`,
      tankId: selectedTank.id,
      issues: selectedIssues,
      description: description || `Reported ${selectedIssues.join(', ')} in ${selectedHostel.name}, ${studentBlock}, ${roomNumber}.`,
    });

    setIsSubmitting(false);
    setSubmittedTicketId('#105');
  };

  /* ---------------- Success ---------------- */
  if (submittedTicketId) {
    return (
      <div className="flex min-h-[32rem] flex-col justify-between rounded-[2rem] bg-white p-7 ring-1 ring-blue-100">
        <div>
          <Tank percent={100} />
          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.3em] text-blue-400">Report sent</p>
          <h1 className="mt-2 text-[5.5rem] font-black leading-none tracking-tighter text-blue-600">
            {submittedTicketId}
          </h1>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-500">
            Thank you. Your report is in the facilities queue and someone will take a look soon.
          </p>

          <dl className="mt-8 divide-y divide-blue-50 border-y border-blue-50 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-slate-400">Where</dt>
              <dd className="font-bold text-slate-900">
                {studentBlock}, {roomNumber}
              </dd>
            </div>
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-slate-400">What</dt>
              <dd className="text-right font-bold text-slate-900">{selectedIssues.join(', ')}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-400">Status</dt>
              <dd className="font-bold text-blue-600">Investigating</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => router.push('/student/history')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            Track my complaint <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSubmittedTicketId(null);
              setSelectedIssues(['Bad smell']);
              setDescription('');
              setStep(0);
            }}
            className="w-full py-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            File another report
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- Wizard ---------------- */
  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-[32rem] flex-col rounded-[2rem] bg-white p-7 ring-1 ring-blue-100"
    >
      {/* Top: tank + step label */}
      <div className="flex items-center gap-4">
        <Tank percent={((step + 1) / STEPS.length) * 100} />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-400">
            Report a water problem
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
      </div>

      {/* Question */}
      <div className="relative mt-8 flex-1">
        <span className="pointer-events-none absolute -top-6 right-0 select-none text-[7rem] font-black leading-none text-blue-50">
          0{step + 1}
        </span>

        <div className="relative">
          <h1 className="max-w-[16rem] text-[1.75rem] font-black leading-tight tracking-tight text-slate-900">
            {STEPS[step].q}
          </h1>
          <p className="mt-2 text-xs text-slate-400">{STEPS[step].hint}</p>

          <div className="mt-7">
            {/* Step 1: issues as big rows */}
            {step === 0 && (
              <ul className="space-y-2">
                {COMMON_ISSUES.map((issue) => {
                  const isChecked = selectedIssues.includes(issue);
                  return (
                    <li key={issue}>
                      <button
                        type="button"
                        onClick={() => toggleIssue(issue)}
                        aria-pressed={isChecked}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition ${
                          isChecked
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'bg-blue-50/70 text-slate-700 hover:bg-blue-50'
                        }`}
                      >
                        {issue}
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            isChecked ? 'border-white bg-white text-blue-600' : 'border-blue-200'
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Step 2: location as underlined fields */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Hostel</label>
                  <select
                    value={selectedHostelId}
                    onChange={(e) => {
                      const newHostelId = e.target.value;
                      setSelectedHostelId(newHostelId);
                      const targetHostel = hostels.find((h) => h.id === newHostelId);
                      if (targetHostel && targetHostel.blocks.length > 0) {
                        setStudentBlock(targetHostel.blocks[0]);
                      }
                    }}
                    className={underlineField}
                  >
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                      Block / wing
                    </label>
                    <select
                      value={studentBlock}
                      onChange={(e) => setStudentBlock(e.target.value)}
                      className={underlineField}
                    >
                      {selectedHostel.blocks.map((blk) => (
                        <option key={blk} value={blk}>
                          {blk}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                      Room / floor
                    </label>
                    <input
                      type="text"
                      required
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Room 304"
                      className={underlineField}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: description */}
            {step === 2 && (
              <div>
                <textarea
                  rows={5}
                  required
                  autoFocus
                  placeholder="The tap water had an earthy smell and a slight yellow tint starting around 9:30 AM…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${underlineField} resize-none text-base font-medium leading-relaxed`}
                />
                <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-700">
                  Reporting <b>{selectedIssues.join(', ')}</b> in <b>{studentBlock}</b>, {roomNumber}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="mt-8 flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            aria-label="Back"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition hover:bg-blue-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {step < lastStep ? (
          <button
            type="button"
            disabled={!canAdvance}
            onClick={() => setStep(step + 1)}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:bg-blue-200 disabled:shadow-none"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting || !canAdvance}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:bg-blue-200 disabled:shadow-none"
          >
            {isSubmitting ? 'Sending…' : 'Send report'} <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}