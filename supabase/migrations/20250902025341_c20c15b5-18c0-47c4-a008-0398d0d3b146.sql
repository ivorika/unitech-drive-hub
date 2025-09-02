-- Create sample instructor and admin users
-- Note: You'll need to create the actual auth users first in Supabase dashboard,
-- then update the user_id values below

-- Sample instructor data
INSERT INTO profiles (user_id, email, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'instructor@unitech.edu.pg', 'instructor'),
  ('00000000-0000-0000-0000-000000000002', 'admin@unitech.edu.pg', 'admin');

-- Sample instructor details
INSERT INTO instructors (
  user_id, 
  first_name, 
  last_name, 
  email, 
  phone, 
  license_number, 
  license_expiry_date, 
  years_of_experience, 
  hourly_rate, 
  specializations, 
  bio, 
  status
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'John',
  'Smith', 
  'instructor@unitech.edu.pg',
  '+675 7123 4567',
  'PNG-DL-123456',
  '2026-12-31',
  8,
  45.00,
  ARRAY['Manual Transmission', 'Automatic Transmission', 'Parallel Parking'],
  'Experienced driving instructor with 8 years of teaching experience. Specializes in nervous drivers and defensive driving techniques.',
  'active'
);

-- Sample admin details  
INSERT INTO admins (
  user_id,
  first_name,
  last_name, 
  email,
  phone,
  password
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Jane',
  'Administrator',
  'admin@unitech.edu.pg', 
  '+675 7987 6543',
  'admin_temp_password'
);