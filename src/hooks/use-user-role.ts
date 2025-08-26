import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserRole {
  role: 'student' | 'instructor' | 'admin' | null;
  loading: boolean;
  profileId: string | null;
}

export const useUserRole = (): UserRole => {
  const { user } = useAuth();
  const [role, setRole] = useState<'student' | 'instructor' | 'admin' | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setProfileId(null);
        setLoading(false);
        return;
      }

      try {
        // Get user role from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, user_id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
          setProfileId(null);
        } else if (profile) {
          setRole(profile.role as 'student' | 'instructor' | 'admin');
          setProfileId(profile.user_id);
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setRole(null);
        setProfileId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { role, loading, profileId };
};