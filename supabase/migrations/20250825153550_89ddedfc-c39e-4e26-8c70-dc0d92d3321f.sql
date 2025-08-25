-- Create storage policies for student uploads
CREATE POLICY "Students can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id IN ('documents', 'profiles') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id IN ('documents', 'profiles') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id IN ('documents', 'profiles') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id IN ('documents', 'profiles') AND auth.uid()::text = (storage.foldername(name))[1]);