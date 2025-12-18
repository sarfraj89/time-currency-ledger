import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Schedule = Database['public']['Tables']['schedules']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export const useDashboardData = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [completions, setCompletions] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Fetch Schedules
                    const { data: schedulesData } = await supabase
                        .from('schedules')
                        .select('*')
                        .eq('user_id', user.id);

                    if (schedulesData) setSchedules(schedulesData);

                    // Fetch Profile
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (profileData) setProfile(profileData);

                    // Fetch Completions (for this week - simplified to all for now or filter by date client side)
                    const { data: completionsData } = await supabase
                        .from('task_completions')
                        .select('*')
                        .eq('user_id', user.id);

                    if (completionsData) setCompletions(completionsData);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Realtime subscriptions
        const scheduleChannel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'schedules',
                },
                (payload) => {
                    console.log('Realtime change received!', payload);
                    // Refresh data on change
                    fetchData();
                    // Note: For optimization, we could handle insert/update/delete locally 
                    // without re-fetching, but re-fetching ensures consistency for now.
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(scheduleChannel);
        };
    }, []);

    return { schedules, loading, profile, completions, isEmpty: schedules.length === 0 };
};
