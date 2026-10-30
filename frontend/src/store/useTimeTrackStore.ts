import { create } from 'zustand';
import API_BASE_URL from '../config/api';

export interface Group {
  _id: string;
  name: string;
  color: string;
  userId: string;
}

export interface CalendarEvent {
  id?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  groupId?: string | null;
  group?: { name: string; color: string } | null;
  isMultiDay?: boolean;
  hoursPerDay?: number;
  timeOfDay?: string;
  [key: string]: any;
}

interface TimeTrackState {
  events: CalendarEvent[];
  groups: Group[];
  isLoading: boolean;
  isAssigning: boolean;
  error: string | null;
  selectedDate: string | null;

  fetchEvents: (days?: number) => Promise<void>;
  fetchGroups: () => Promise<void>;
  createGroup: (group: { name: string; color: string }) => Promise<void>;
  assignEventToGroup: (eventId: string, groupId: string | null, isMultiDay?: boolean, hoursPerDay?: number, timeOfDay?: string) => Promise<boolean>;
  resetAllMappings: () => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  setSelectedDate: (date: string | null) => void;
}

export const useTimeTrackStore = create<TimeTrackState>((set, get) => ({
  events: [],
  groups: [],
  isLoading: false,
  isAssigning: false,
  error: null,
  selectedDate: null,

  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchEvents: async (days = 7) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/calendar/events?days=${days}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      set({ events: data.events || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchGroups: async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch groups');
      const data = await res.json();
      set({ groups: Array.isArray(data) ? data : [] });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createGroup: async (groupData) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(groupData),
      });
      if (!res.ok) throw new Error('Failed to create group');
      await get().fetchGroups();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  assignEventToGroup: async (eventId, groupId, isMultiDay = false, hoursPerDay = 2, timeOfDay = 'flexible') => {
    const previousEvents = get().events;
    const targetGroup = get().groups.find((g) => g._id === groupId);

    const updatedEvents = previousEvents.map((ev) => {
      if (ev.id === eventId) {
        return {
          ...ev,
          groupId: groupId,
          isMultiDay,
          hoursPerDay,
          timeOfDay,
          group: groupId && targetGroup ? { name: targetGroup.name, color: targetGroup.color } : null,
        };
      }
      return ev;
    });

    set({ events: updatedEvents, isAssigning: true, error: null });

    try {
      const token = localStorage.getItem('jwt_token');
      let res: Response;

      if (!groupId) {
        res = await fetch(`${API_BASE_URL}/mappings/${eventId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        res = await fetch(`${API_BASE_URL}/mappings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventId, groupId, isMultiDay, hoursPerDay, timeOfDay }),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update mapping on server');
      }

      set({ isAssigning: false });
      return true;
    } catch (err: any) {
      console.error('Assign error:', err);
      set({ events: previousEvents, error: err.message, isAssigning: false });
      alert(`Lỗi khi gán nhóm: ${err.message}. Đã khôi phục trạng thái cũ.`);
      return false;
    }
  },

  resetAllMappings: async () => {
    const previousEvents = get().events;
    const updatedEvents = previousEvents.map((ev) => ({
      ...ev,
      groupId: null,
      group: null,
      isMultiDay: false,
      hoursPerDay: 2,
      timeOfDay: 'flexible',
    }));

    set({ events: updatedEvents, isAssigning: true, error: null });

    try {
      const token = localStorage.getItem('jwt_token');
      // Lấy tất cả các sự kiện đang có groupId và gọi DELETE hoặc tạo endpoint bulk reset nếu có
      const assignedEvents = previousEvents.filter((ev) => ev.groupId);
      
      await Promise.all(
        assignedEvents.map((ev) =>
          fetch(`${API_BASE_URL}/mappings/${ev.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      set({ isAssigning: false });
      await get().fetchEvents();
    } catch (err: any) {
      console.error('Reset error:', err);
      set({ events: previousEvents, error: err.message, isAssigning: false });
      alert(`Lỗi khi đặt lại: ${err.message}`);
    }
  },

  deleteGroup: async (groupId: string) => {
    const token = localStorage.getItem('jwt_token');
    try {
      // 1. Delete the group from backend
      const res = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete group');
      }

      // 2. Remove group from local state
      const currentGroups = get().groups;
      set({ groups: currentGroups.filter((g) => g._id !== groupId) });

      // 3. Unassign events that were in this group (set groupId to null)
      const previousEvents = get().events;
      const updatedEvents = previousEvents.map((ev) => {
        if (ev.groupId === groupId) {
          return {
            ...ev,
            groupId: null,
            group: null,
            isMultiDay: false,
            hoursPerDay: 2,
            timeOfDay: 'flexible',
          };
        }
        return ev;
      });
      set({ events: updatedEvents });

      // 4. Refresh events from server to ensure consistency
      await get().fetchEvents();
      await get().fetchGroups();
      
    } catch (err: any) {
      console.error('Delete group error:', err);
      set({ error: err.message });
      alert(`Lỗi khi xóa nhóm: ${err.message}`);
      throw err;
    }
  },
}));

