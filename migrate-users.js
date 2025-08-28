// Script to help migrate existing users to the new profiles system
// Run this in the browser console after logging in

const { supabase } = window;

async function migrateCurrentUser() {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return;
    }
    
    if (!user) {
      console.log('No user logged in');
      return;
    }
    
    console.log('Current user:', user.email);
    
    // Check if profile already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile check error:', profileError);
      return;
    }
    
    if (existingProfile) {
      console.log('Profile already exists:', existingProfile);
      return;
    }
    
    // Create profile for current user (default to student role)
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        role: 'student' // Default role
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating profile:', insertError);
      return;
    }
    
    console.log('Profile created successfully:', newProfile);
    console.log('You may need to refresh the page for changes to take effect');
    
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Add to global scope for easy access
window.migrateCurrentUser = migrateCurrentUser;

console.log('Migration script loaded. Run migrateCurrentUser() in console to migrate your user.');
