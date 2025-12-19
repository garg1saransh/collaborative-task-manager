import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type User = {
  id: string;
  email: string;
  name: string | null;
};

type Props = {
  token: string;
  onClose: () => void;
};

export function ProfilePanel({ token, onClose }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ user: User }>({
    queryKey: ['me', token],
    queryFn: async () => {
      const res = await fetch('http://localhost:3001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to load profile');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setName(data.user.name ?? '');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newName: string) => {
      const res = await fetch('http://localhost:3001/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        throw new Error('Failed to update profile');
      }
      return res.json() as Promise<{ user: User }>;
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['me', token], res);
      setLocalError(null);

      // sync updated name into localStorage auth
      const raw = localStorage.getItem('auth');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const next = {
            ...parsed,
            user: {
              ...parsed.user,
              name: res.user.name,
            },
          };
          localStorage.setItem('auth', JSON.stringify(next));
        } catch {
          // ignore parse errors
        }
      }

      setSuccess('Profile updated successfully');
    },
    onError: (err: any) => {
      setLocalError(err.message ?? 'Failed to update profile');
    },
  });

  const user = data?.user;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end bg-black/30">
      <div className="h-full w-full max-w-sm bg-white shadow-xl border-l border-gray-100 px-6 py-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Profile
          </h2>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>

        {isLoading && (
          <p className="text-xs text-gray-400">Loading profile...</p>
        )}

        {!isLoading && user && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSuccess(null);
              updateMutation.mutate(name.trim());
            }}
            className="space-y-4 text-sm"
          >
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none"
                placeholder="Your display name"
              />
            </div>

            {localError && (
              <p className="text-[11px] text-red-500">{localError}</p>
            )}

            {success && (
              <p className="text-[11px] text-green-600">{success}</p>
            )}

            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="w-full rounded-full bg-yellow-400 px-4 py-2 text-xs font-semibold text-gray-900 shadow-sm hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateMutation.isLoading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}