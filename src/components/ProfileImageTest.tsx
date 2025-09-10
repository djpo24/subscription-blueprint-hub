import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ProfileImageTest() {
  const [phone, setPhone] = useState('573014940399');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testProfileImage = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing profile image for phone:', phone);

      const { data, error } = await supabase.functions.invoke('test-profile-image', {
        body: { phone: phone }
      });

      if (error) {
        console.error('❌ Test error:', error);
        toast.error('Error: ' + error.message);
        setResult({ error: error.message });
      } else {
        console.log('✅ Test result:', data);
        toast.success('Test completed successfully');
        setResult(data);
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
      toast.error('Test failed: ' + error.message);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">🧪 Test Profile Image</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Phone Number:</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
          />
        </div>

        <Button onClick={testProfileImage} disabled={loading}>
          {loading ? 'Testing...' : 'Test Profile Image'}
        </Button>

        {result && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Result:</h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.profileUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Profile Image:</p>
                <img 
                  src={result.profileUrl} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full border"
                  onError={(e) => {
                    console.error('❌ Image load error');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}