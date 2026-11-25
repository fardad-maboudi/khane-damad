import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/hooks';
import { getAuthHeaders } from '@/api/auth';

function readBookingSession() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('joorchin-booking-session') : null;
  } catch {
    return null;
  }
}

export function useBookingQuery(name, load, params = {}, options = {}) {
  return useQuery({
    queryKey: [
      ...queryKeys.plugin('bookings'),
      name,
      getAuthHeaders(),
      readBookingSession(),
      params,
    ],
    queryFn: () => load(params),
    staleTime: 0,
    retry: false,
    ...options,
  });
}
export function useBookingMutation(action) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.plugin('bookings') }),
  });
}
