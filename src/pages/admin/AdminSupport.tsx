import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import {
  Ticket,
  MessageSquare,
  Send,
} from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Fetch support tickets
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const res = await api.get('/admin/tickets');
      return res.data.tickets || [];
    },
  });

  // Reply Ticket Mutation
  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const res = await api.post(`/admin/tickets/${ticketId}/reply`, { message });
      return res.data.ticket;
    },
    onSuccess: () => {
      showToast('Support reply registered', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      setReplyText('');
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Could not submit reply', 'error');
    },
  });

  const tickets = ticketsData || [];
  const activeTicket = tickets.find((t: any) => t._id === activeTicketId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyText.trim()) return;
    replyMutation.mutate({ ticketId: activeTicketId, message: replyText });
  };

  return (
    <div className="px-gutter py-6 max-w-5xl mx-auto space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h2 className="font-headline-lg text-lg font-black text-on-surface">Support Center</h2>
        <p className="text-secondary font-body-sm text-[10px]">Resolve client disputes, delivery delays, and merchant issues.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-100 rounded-3xl animate-pulse md:col-span-1" />
          <div className="h-64 bg-gray-100 rounded-3xl animate-pulse md:col-span-2" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tickets List */}
          <div className="space-y-3 md:col-span-1 overflow-y-auto max-h-[70vh]">
            {tickets.map((t: any) => (
              <div
                key={t._id}
                onClick={() => setActiveTicketId(t._id)}
                className={`p-4 rounded-2xl border cursor-pointer text-left transition-all ${
                  activeTicketId === t._id
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/10 bg-white hover:bg-gray-50/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    {t.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-wider ${
                    t.priority === 'High' || t.priority === 'Urgent'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t.priority}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-on-surface mt-2.5 truncate">{t.subject}</h4>
                
                <div className="flex justify-between items-center text-[10px] text-secondary mt-2">
                  <span>Status: <strong className="text-on-surface">{t.status}</strong></span>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Ticket Chat Console */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-outline-variant/10 shadow-xs flex flex-col justify-between overflow-hidden min-h-[60vh] max-h-[70vh]">
            {activeTicket ? (
              <>
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <span className="text-[9px] font-bold bg-orange-100 text-primary px-2.5 py-1 rounded-lg uppercase">
                    Ticket ID: #{activeTicket._id.substring(activeTicket._id.length - 8).toUpperCase()}
                  </span>
                  <h3 className="text-xs font-black text-on-surface mt-3">{activeTicket.subject}</h3>
                  <p className="text-[10px] text-secondary mt-1 leading-relaxed">
                    Description: {activeTicket.description}
                  </p>
                </div>

                {/* Messages Body */}
                <div className="flex-grow overflow-y-auto p-5 space-y-4">
                  {activeTicket.replies.map((reply: any, idx: number) => {
                    const isSelf = reply.name === 'Fretza Admin';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[80%] ${
                          isSelf ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <span className="text-[8px] text-secondary mb-1">
                          {reply.name} • {new Date(reply.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isSelf ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-on-surface rounded-tl-none'
                        }`}>
                          {reply.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="p-4 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type support reply or update notes..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-grow bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-primary text-white rounded-xl shadow-md hover:bg-orange-600 active:scale-95 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-grow flex flex-col justify-center items-center p-8 text-center text-secondary">
                <MessageSquare className="w-8 h-8 text-gray-300" />
                <h4 className="text-xs font-bold text-on-surface mt-2">Select support ticket</h4>
                <p className="text-[10px] text-secondary mt-1">Review active complaints and trigger support replies.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
          <Ticket className="w-8 h-8 text-gray-300 mx-auto" />
          <h4 className="text-xs font-bold text-on-surface mt-2">No support tickets listed</h4>
        </div>
      )}

    </div>
  );
};
