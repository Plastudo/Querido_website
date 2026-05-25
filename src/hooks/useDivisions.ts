import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Division {
  id: number;
  prefix: string | null;
  label: string;
  subtitle: string;
  icon_type: string;
  bg_color: string;
  icon_color: string;
  is_active: boolean;
  order_index: number;
}

export function useDivisions() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('divisions')
      .select('*')
      .eq('is_active', true)
      .order('order_index')
      .then(({ data }) => {
        if (data) setDivisions(data as Division[]);
        setIsLoading(false);
      });
  }, []);

  return { divisions, isLoading };
}
