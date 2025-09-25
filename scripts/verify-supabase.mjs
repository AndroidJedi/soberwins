import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY
const emailArg = process.argv[2]
const email = emailArg || `verify+${Date.now()}@example.com`

if (!url || !anon) {
  console.error('Missing env. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(url, anon, { auth: { persistSession: false } })

async function main() {
  try {
    console.log('Inserting email:', email)
    const { error: insertError } = await supabase
      .from('early_access_leads')
      .insert({ email })

    if (insertError) throw insertError

    const { data, error } = await supabase
      .from('early_access_leads')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (error) throw error

    if (!data || !data.length) {
      console.error('Insert verification failed: row not found')
      process.exit(2)
    }

    console.log('Verified row:', data[0])
    console.log('SUCCESS')
    process.exit(0)
  } catch (e) {
    console.error('Script error:', e.message || e)
    process.exit(3)
  }
}

main()


