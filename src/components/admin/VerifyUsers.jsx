'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function VerifyUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await api.getPendingVerifications();
      setUsers(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDecision = async (userId, decision) => {
    try {
      await api.verifyUser(userId, { decision, note: decision === 'reject' ? 'ID not valid' : '' });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="text-slate-500 text-sm">Loading...</p>;
  if (!users.length) return <p className="text-slate-500 text-sm">No pending verifications</p>;

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-slate-800">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-500">{user.email} &middot; {user.userType}</p>
              {user.verificationIdUrl && (
                <a href={user.verificationIdUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline">View ID</a>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleDecision(user.id, 'approve')}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                Approve
              </button>
              <button onClick={() => handleDecision(user.id, 'reject')}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
