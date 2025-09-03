import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const ConfirmEmail = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check URL parameters for auth tokens from email confirmation
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');
        
        // Handle token-based confirmation (works across devices)
        if (accessToken && refreshToken && type === 'signup') {
          try {
            // Clear any existing session first to ensure clean state
            await supabase.auth.signOut();
            
            // Set the new session using tokens from the confirmation email
            const { data: { session }, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) {
              throw sessionError;
            }
            
            if (session?.user) {
              setStatus('success');
              setMessage('Email confirmed successfully! Your account is now verified.');
              
              // Create or update profile for confirmed user
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              
              if (!existingProfile) {
                // Create student profile for new signups
                await supabase
                  .from('profiles')
                  .insert({
                    user_id: session.user.id,
                    email: session.user.email,
                    role: 'student'
                  });
              }
              
              // Redirect after confirmation
              setTimeout(() => {
                navigate('/student-portal');
              }, 2000);
              return;
            }
          } catch (tokenError) {
            console.error('Token-based confirmation failed:', tokenError);
            // Fall through to alternative confirmation methods
          }
        }
        
        // Handle hash-based confirmation (backup method)
        if (window.location.hash.includes('access_token')) {
          try {
            const { data: { session }, error: hashError } = await supabase.auth.getSession();
            
            if (hashError) {
              throw hashError;
            }
            
            if (session?.user) {
              setStatus('success');
              setMessage('Email confirmed successfully! You are now logged in.');
              
              // Get user role to determine redirect
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              
              setTimeout(() => {
                if (profile?.role === 'student') {
                  navigate('/student-portal');
                } else if (profile?.role === 'instructor') {
                  navigate('/instructor-dashboard');
                } else if (profile?.role === 'admin') {
                  navigate('/admin-dashboard');
                } else {
                  navigate('/student-portal'); // Default for new users
                }
              }, 2000);
              return;
            }
          } catch (hashError) {
            console.error('Hash-based confirmation failed:', hashError);
          }
        }
        
        // If no tokens in URL, this might be an invalid confirmation link
        if (!accessToken && !refreshToken && !window.location.hash.includes('access_token')) {
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email for the correct link or try signing up again.');
          return;
        }
        
        // Final fallback - check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session?.user) {
          setStatus('success');
          setMessage('You are already logged in!');
          
          // Get user role to determine redirect
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          
          setTimeout(() => {
            if (profile?.role === 'student') {
              navigate('/student-portal');
            } else if (profile?.role === 'instructor') {
              navigate('/instructor-dashboard');
            } else if (profile?.role === 'admin') {
              navigate('/admin-dashboard');
            } else {
              navigate('/');
            }
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Email confirmation failed. Please try logging in manually or sign up again if you haven\'t created an account yet.');
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage(error.message?.includes('Invalid token') 
          ? 'This confirmation link has expired or is invalid. Please request a new confirmation email.'
          : 'Please try logging in manually to complete the verification process.'
        );
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Confirming your email...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2">Success!</h2>
            <p className="mb-4">{message}</p>
            <Button onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="mb-4">{message}</p>
            <Button onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
