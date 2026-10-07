'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAquaGuard } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquareWarning,
  CheckCircle2,
  Building,
  ArrowRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const COMMON_ISSUES = [
  'Bad smell',
  'Bad taste',
  'Discoloration',
  'Visible particles',
  'Low water pressure',
  'Other',
];

export default function StudentComplaintPage() {
  const router = useRouter();
  const { session, hostels, selectedHostelId, setSelectedHostelId, selectedHostel, selectedTank, addComplaint } = useAquaGuard();

  const [selectedIssues, setSelectedIssues] = useState<string[]>(['Bad smell']);
  const [description, setDescription] = useState('');
  const [roomNumber, setRoomNumber] = useState(session.room || 'Room 304');
  const [studentBlock, setStudentBlock] = useState(session.block || selectedHostel.blocks[0] || 'Block A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-zinc-800">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          Crowdsourced Facilities Watch
        </span>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
          <MessageSquareWarning className="h-5 w-5 text-white" />
          Report Water Problem
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Notice strange odor, murky color, or chlorine taste? Your report alerts the campus sanitation team instantly.
        </p>
      </div>

      {submittedTicketId ? (
        /* Submission Success Receipt */
        <div className="p-6 rounded-2xl border border-white bg-zinc-950 text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-zinc-400">Complaint Ticket Dispatched</span>
            <h2 className="text-2xl font-extrabold font-mono text-white">{submittedTicketId}</h2>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto pt-1">
              Your grievance has been logged and assigned to the facilities dispatch queue.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-black border border-zinc-800 text-xs font-mono text-left space-y-1 max-w-sm mx-auto">
            <div>Block: <span className="text-white font-bold">{studentBlock}</span></div>
            <div>Room: <span className="text-white font-bold">{roomNumber}</span></div>
            <div>Issues: <span className="text-white">{selectedIssues.join(', ')}</span></div>
            <div>Status: <span className="text-white font-bold">🟡 Investigating</span></div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
            <Button
              className="w-full text-xs font-bold"
              onClick={() => router.push('/student/history')}
            >
              Track in My Complaints
            </Button>
            <Button
              variant="outline"
              className="w-full text-xs font-bold"
              onClick={() => {
                setSubmittedTicketId(null);
                setSelectedIssues(['Bad smell']);
                setDescription('');
              }}
            >
              File Another Report
            </Button>
          </div>
        </div>
      ) : (
        /* Form matching Section 9 schema */
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider font-mono">
                1. What did you notice?
              </CardTitle>
              <CardDescription>Select all sensory or pressure symptoms observed</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Checkboxes matching user prompt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COMMON_ISSUES.map((issue) => {
                  const isChecked = selectedIssues.includes(issue);
                  return (
                    <label
                      key={issue}
                      onClick={() => toggleIssue(issue)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                        isChecked
                          ? 'border-white bg-zinc-900 text-white font-semibold'
                          : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded accent-white cursor-pointer"
                      />
                      <span className="text-xs font-mono">{issue}</span>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Location & Room Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider font-mono">
                2. Location Information
              </CardTitle>
              <CardDescription>Select your campus hostel and room location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Campus Hostel</label>
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
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white"
                >
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Hostel Block / Wing</label>
                  <select
                    value={studentBlock}
                    onChange={(e) => setStudentBlock(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white"
                  >
                    {selectedHostel.blocks.map((blk) => (
                      <option key={blk} value={blk}>
                        {blk}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Room / Floor</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 304, 3rd Floor"
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description Textarea */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider font-mono">
                3. Description
              </CardTitle>
              <CardDescription>Provide any additional context or timeline details</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                rows={4}
                required
                placeholder="e.g. Water coming out from bathroom tap had an unusual earthy smell and slight yellow tint starting around 9:30 AM..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 text-sm font-bold bg-white text-black hover:bg-zinc-200"
            >
              {isSubmitting ? 'Dispatching Ticket...' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
