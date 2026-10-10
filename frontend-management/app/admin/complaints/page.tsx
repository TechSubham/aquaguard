'use client';

import React, { useState } from 'react';
import { useAquaGuard } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Complaint } from '@/lib/types';
import {
  MessageSquareWarning,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function AdminComplaintsPage() {
  const { complaints, updateComplaintStatus } = useAquaGuard();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'INVESTIGATING' | 'RESOLVED'>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComplaints = complaints.filter((c) => {
    const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issues.some((issue) => issue.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: complaints.length,
    open: complaints.filter((c) => c.status === 'OPEN').length,
    investigating: complaints.filter((c) => c.status === 'INVESTIGATING').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
  };

  const handleStatusChange = (status: Complaint['status']) => {
    if (!selectedComplaint) return;
    updateComplaintStatus(selectedComplaint.id, status, adminNoteInput || undefined);
    setSelectedComplaint((prev) => (prev ? { ...prev, status, adminNotes: adminNoteInput || prev.adminNotes } : null));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300">
              Student Grievance Triage
            </span>
            <span className="text-xs font-mono text-zinc-500">Live Campus Feed</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <MessageSquareWarning className="h-6 w-6 text-white" />
            Hostel Water Complaints
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Crowdsourced sensory feedback correlated with IoT sensor telemetry to rapidly isolate contamination clusters.
          </p>
        </div>

        {/* Filter stats bar */}
        <div className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800">
          {(['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 ${
                filterStatus === st
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{st}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterStatus === st ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {st === 'ALL'
                  ? counts.all
                  : st === 'OPEN'
                  ? counts.open
                  : st === 'INVESTIGATING'
                  ? counts.investigating
                  : counts.resolved}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Secondary Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ticket #, hostel block, or complaint keyword (e.g. smell, pressure)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Main Grid: List and Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaints Cards List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center border border-zinc-800 rounded-xl bg-zinc-950">
              <CheckCircle2 className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">No Complaints Found</div>
              <div className="text-xs text-zinc-500 mt-1">There are no reports matching the current filter.</div>
            </div>
          ) : (
            filteredComplaints.map((item) => {
              const isSelected = selectedComplaint?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedComplaint(item);
                    setAdminNoteInput(item.adminNotes || '');
                  }}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-white bg-zinc-900/90 shadow-lg'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-extrabold text-white">{item.id}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 flex items-center gap-1">
                        <Building className="h-3 w-3" /> {item.block}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">Tank: {item.tankId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.status === 'OPEN'
                            ? 'danger'
                            : item.status === 'INVESTIGATING'
                            ? 'outline'
                            : 'secondary'
                        }
                        className="font-mono text-[10px]"
                      >
                        {item.status}
                      </Badge>
                      <span className="text-[11px] text-zinc-500 font-mono">{item.submittedAt}</span>
                    </div>
                  </div>

                  {/* Complaint Description and Issues */}
                  <div className="py-3 space-y-2">
                    <div className="text-sm font-semibold text-white">
                      &quot;{item.description}&quot;
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {item.issues.map((issue, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-black border border-zinc-800 text-zinc-300"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Student Cluster Notice (from user spec: "12 students reported similar issue") */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    {item.clusterCount && item.clusterCount > 1 ? (
                      <div className="flex items-center gap-2 text-xs font-mono text-white bg-black border border-zinc-800 px-3 py-1.5 rounded-lg">
                        <Users className="h-4 w-4 text-white" />
                        <span className="font-bold">{item.clusterCount} students</span>
                        <span className="text-zinc-400">reported similar issue in this block</span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500 font-mono">Reported by: {item.studentName} ({item.studentRoll})</span>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-zinc-300 hover:text-white flex items-center gap-1"
                    >
                      <span>View & Manage</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Complaint Detail & Triage Action */}
        <div className="space-y-6">
          {selectedComplaint ? (
            <Card className="sticky top-6">
              <CardHeader className="pb-3 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-mono">
                    Ticket Triage: {selectedComplaint.id}
                  </CardTitle>
                  <Badge variant="outline">{selectedComplaint.status}</Badge>
                </div>
                <CardDescription>
                  Submitted by {selectedComplaint.studentName} • {selectedComplaint.studentRoll}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Hostel Location</span>
                  <div className="text-xs font-semibold text-white mt-0.5">
                    {selectedComplaint.block} • Source Tank: {selectedComplaint.tankId}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Reported Issues</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedComplaint.issues.map((i) => (
                      <span key={i} className="text-xs font-mono px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-white">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Detailed Description</span>
                  <p className="text-xs text-zinc-300 mt-1 p-3 rounded-lg bg-black border border-zinc-800 leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Status Switcher Buttons */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Update Ticket Status</span>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant={selectedComplaint.status === 'OPEN' ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setSelectedComplaint(prev => prev ? { ...prev, status: 'OPEN' } : null)}
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedComplaint.status === 'INVESTIGATING' ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setSelectedComplaint(prev => prev ? { ...prev, status: 'INVESTIGATING' } : null)}
                    >
                      Investigating
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedComplaint.status === 'RESOLVED' ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setSelectedComplaint(prev => prev ? { ...prev, status: 'RESOLVED' } : null)}
                    >
                      Resolved
                    </Button>
                  </div>
                </div>

                {/* Facilities Admin Notes */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Facilities Action Note</span>
                  <textarea
                    rows={3}
                    placeholder="e.g. Sent plumbing technician to inspect inlet valve and chlorine dosing pump..."
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
                  />
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleStatusChange(selectedComplaint.status)}
                  >
                    Save Note & Sync Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 border border-zinc-800 rounded-xl bg-zinc-950 text-center">
              <MessageSquareWarning className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">Select a Ticket</div>
              <div className="text-xs text-zinc-500 mt-1">
                Click on any student complaint from the list to inspect details and assign workflow status.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
