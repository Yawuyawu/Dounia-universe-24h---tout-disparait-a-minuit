import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://rlwfrbnowfrbbdppuexr.supabase.co'
const supabaseKey = 'sb_publishable_uWfVatuHXLQ-J04j7wiYZg_DtK-kBDo'
export const supabase = createClient(supabaseUrl, supabaseKey)
