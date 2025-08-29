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
        // Check if there's a session (user might be automatically logged in after confirmation)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
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
            } else {
              navigate('/');
            }
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Email confirmation failed. Please try logging in again.');
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred during email confirmation.');
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
