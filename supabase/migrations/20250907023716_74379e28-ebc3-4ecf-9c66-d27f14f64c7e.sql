-- Make the profiles bucket public so profile pictures can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'profiles';

-- Create RLS policies for profile pictures access
CREATE POLICY "Public profile pictures are viewable by everyone" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profiles');

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile picture" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile picture" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile picture" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);