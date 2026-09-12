-- ========================================================
-- AI-Powered Customer Support System Database Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ========================================================

-- Enable pgcrypto extension for gen_random_uuid() if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create support_requests table
CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    complaint TEXT NOT NULL,
    category TEXT DEFAULT 'General Inquiry',
    urgency TEXT DEFAULT 'Medium' CHECK (urgency IN ('Low', 'Medium', 'High', 'Critical')),
    ai_summary TEXT,
    ai_reply TEXT,
    status TEXT NOT NULL DEFAULT 'AI Responded' CHECK (status IN ('Pending', 'AI Responded', 'Resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index frequently filtered and sorted columns
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON public.support_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests (status);
CREATE INDEX IF NOT EXISTS idx_support_requests_urgency ON public.support_requests (urgency);
CREATE INDEX IF NOT EXISTS idx_support_requests_category ON public.support_requests (category);

-- Trigger function for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_support_requests_updated_at ON public.support_requests;
CREATE TRIGGER tr_support_requests_updated_at
    BEFORE UPDATE ON public.support_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role key full access
-- Service role key automatically bypasses RLS in Supabase, but explicit policy is good practice
CREATE POLICY "Allow service role full access"
    ON public.support_requests
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Allow anonymous/authenticated read access if needed for dashboard
CREATE POLICY "Allow read access to support requests"
    ON public.support_requests
    FOR SELECT
    TO anon, authenticated
    USING (true);
