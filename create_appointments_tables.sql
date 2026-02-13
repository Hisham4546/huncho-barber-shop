/*
  # Create appointments table for HUNCHO BARBER SHOP

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key) - Unique identifier for each appointment
      - `customer_name` (text) - Full name of the customer
      - `phone_number` (text) - Customer's phone number for contact
      - `service` (text) - Type of service requested
      - `appointment_date` (date) - Date of the appointment
      - `appointment_time` (text) - Time slot for the appointment
      - `notes` (text, optional) - Additional notes or special requests
      - `status` (text) - Appointment status (pending, confirmed, completed, cancelled)
      - `created_at` (timestamptz) - When the appointment was booked
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `appointments` table
    - Add policy for public insert (anyone can book)
    - Add policy for authenticated users to read all appointments (for admin/staff)
    
  3. Notes
    - This table stores all appointment bookings for the barbershop
    - Default status is 'pending' for new appointments
    - Phone numbers are stored as text to preserve formatting
*/

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  service text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  notes text DEFAULT '',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create appointments (public booking)
CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read all appointments (for staff/admin)
CREATE POLICY "Authenticated users can view all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update appointment status
CREATE POLICY "Authenticated users can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index on appointment date for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
