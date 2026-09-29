/*
# JanSetu — Core Database Schema

## Overview
Creates the complete database schema for the JanSetu citizen-government service platform.
This is a multi-user app with authentication (citizens and admins).

## New Tables

1. **profiles** — extends auth.users with role (citizen/admin), full_name, preferred_language
2. **categories** — service categories (Certificates, Healthcare, Education, etc.)
3. **services** — government services with description, eligibility, documents, procedure, official_link
4. **saved_services** — bookmarks linking users to services they saved
5. **grievances** — contact/grievance submissions from users
6. **announcements** — admin-published platform announcements
7. **ai_conversations** — stores AI chat conversations per user

## Security (RLS)
- profiles: users read/update own profile; admins read all
- categories: public read (anon + authenticated); admin write
- services: public read; admin write
- saved_services: owner-scoped CRUD
- grievances: owner can read own; anyone (anon+auth) can insert; admin can read all
- announcements: public read; admin write
- ai_conversations: owner-scoped CRUD

## Notes
- profiles.role defaults to 'citizen' and is protected server-side (users cannot change their own role)
- All owner columns default to auth.uid() so inserts work without explicitly passing user_id
*/

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  preferred_language text NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'mr')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- Users can update their own profile (but NOT their role — handled via trigger)
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-insert profile on signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, preferred_language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'citizen', 'en')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prevent users from changing their own role via UPDATE
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can change roles; users cannot change their own role
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    PERFORM 1 FROM profiles WHERE id = auth.uid() AND role = 'admin';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'You cannot change your own role';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_profile_update ON profiles;
CREATE TRIGGER before_profile_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- ============================================================
-- 2. CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_hi text,
  name_mr text,
  slug text UNIQUE NOT NULL,
  icon text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Admin write
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- ============================================================
-- 3. SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  name_hi text,
  name_mr text,
  description text,
  description_hi text,
  description_mr text,
  eligibility text,
  eligibility_hi text,
  eligibility_mr text,
  required_documents text,
  required_documents_hi text,
  required_documents_mr text,
  procedure text,
  procedure_hi text,
  procedure_mr text,
  official_link text,
  is_published boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public read (only published)
DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (is_published = true OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Admin write
DROP POLICY IF EXISTS "admin_insert_services" ON services;
CREATE POLICY "admin_insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

DROP POLICY IF EXISTS "admin_update_services" ON services;
CREATE POLICY "admin_update_services" ON services FOR UPDATE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

DROP POLICY IF EXISTS "admin_delete_services" ON services;
CREATE POLICY "admin_delete_services" ON services FOR DELETE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- ============================================================
-- 4. SAVED_SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, service_id)
);

ALTER TABLE saved_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved" ON saved_services;
CREATE POLICY "select_own_saved" ON saved_services FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved" ON saved_services;
CREATE POLICY "insert_own_saved" ON saved_services FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved" ON saved_services;
CREATE POLICY "delete_own_saved" ON saved_services FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 5. GRIEVANCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

-- Anyone (even anonymous) can submit a grievance
DROP POLICY IF EXISTS "insert_grievance" ON grievances;
CREATE POLICY "insert_grievance" ON grievances FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Users can read their own grievances
DROP POLICY IF EXISTS "select_own_grievances" ON grievances;
CREATE POLICY "select_own_grievances" ON grievances FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Admin can update grievance status
DROP POLICY IF EXISTS "admin_update_grievances" ON grievances;
CREATE POLICY "admin_update_grievances" ON grievances FOR UPDATE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- ============================================================
-- 6. ANNOUNCEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_hi text,
  title_mr text,
  content text,
  content_hi text,
  content_mr text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_announcements" ON announcements;
CREATE POLICY "public_read_announcements" ON announcements FOR SELECT
  TO anon, authenticated USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

DROP POLICY IF EXISTS "admin_insert_announcements" ON announcements;
CREATE POLICY "admin_insert_announcements" ON announcements FOR INSERT
  TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

DROP POLICY IF EXISTS "admin_update_announcements" ON announcements;
CREATE POLICY "admin_update_announcements" ON announcements FOR UPDATE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

DROP POLICY IF EXISTS "admin_delete_announcements" ON announcements;
CREATE POLICY "admin_delete_announcements" ON announcements FOR DELETE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- ============================================================
-- 7. AI_CONVERSATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON ai_conversations;
CREATE POLICY "select_own_conversations" ON ai_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_conversations" ON ai_conversations;
CREATE POLICY "insert_own_conversations" ON ai_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_conversations" ON ai_conversations;
CREATE POLICY "delete_own_conversations" ON ai_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_published ON services(is_published);
CREATE INDEX IF NOT EXISTS idx_saved_services_user ON saved_services(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_user ON grievances(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);

-- ============================================================
-- SEED DATA: CATEGORIES
-- ============================================================
INSERT INTO categories (name, name_hi, name_mr, slug, icon, sort_order) VALUES
  ('Certificates', 'प्रमाणपत्र', 'प्रमाणपत्रे', 'certificates', 'FileText', 1),
  ('Documents', 'दस्तावेज', 'कागदपत्रे', 'documents', 'FolderOpen', 2),
  ('Education', 'शिक्षा', 'शिक्षण', 'education', 'GraduationCap', 3),
  ('Healthcare', 'स्वास्थ्य', 'आरोग्य', 'healthcare', 'HeartPulse', 4),
  ('Employment', 'रोजगार', 'रोजगार', 'employment', 'Briefcase', 5),
  ('Welfare Schemes', 'कल्याण योजनाएं', 'कल्याण योजना', 'welfare', 'HandHeart', 6),
  ('Government Forms', 'सरकारी फॉर्म', 'सरकारी फॉर्म', 'forms', 'ClipboardList', 7),
  ('Other Services', 'अन्य सेवाएं', 'इतर सेवा', 'other', 'MoreHorizontal', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: SERVICES (5 representative services)
-- ============================================================
INSERT INTO services (category_id, name, name_hi, name_mr, description, description_hi, description_mr, eligibility, eligibility_hi, eligibility_mr, required_documents, required_documents_hi, required_documents_mr, procedure, procedure_hi, procedure_mr, official_link, is_published, sort_order)
SELECT c.id, s.name, s.name_hi, s.name_mr, s.description, s.description_hi, s.description_mr, s.eligibility, s.eligibility_hi, s.eligibility_mr, s.required_documents, s.required_documents_hi, s.required_documents_mr, s.procedure, s.procedure_hi, s.procedure_mr, s.official_link, true, s.sort_order
FROM (VALUES
  ('certificates', 'Aadhaar Card', 'आधार कार्ड', 'आधार कार्ड',
   'Aadhaar is a 12-digit unique identity number issued by UIDAI to all residents of India.',
   'आधार भारत के सभी निवासियों के लिए UIDAI द्वारा जारी 12-अंकों का एक विशिष्ट पहचान नंबर है।',
   'आधार हे UIDAI द्वारे भारतातील सर्व रहिवासीांसाठी जारी केलेला 12-अंकी अद्वितीय ओळख नंबर आहे.',
   'All residents of India, including newborns, are eligible. There is no age limit.',
   'भारत के सभी निवासी, नवजात शिशुओं सहित, पात्र हैं। कोई आयु सीमा नहीं है।',
   'भारतातील सर्व रहिवासी, जन्मलेल्या बाळांसह, पात्र आहेत. वयाची मर्यादा नाही.',
   'Proof of identity, Proof of address, Proof of date of birth, Biometric data (fingerprints, iris scan)',
   'पहचान का प्रमाण, पते का प्रमाण, जन्म तिथि का प्रमाण, बायोमेट्रिक डेटा (फिंगरप्रिंट, आईरिस स्कैन)',
   'ओळखीचा पुरावा, पत्त्याचा पुरावा, जन्मतारखेचा पुरावा, बायोमेट्रिक डेटा (फिंगरप्रिंट, आयरिस स्कॅन)',
   '1. Visit an Aadhaar enrollment center with required documents.\n2. Fill out the enrollment form.\n3. Submit biometric and demographic data.\n4. Receive acknowledgment slip with enrollment ID.\n5. Aadhaar card is delivered to your address within 60-90 days.',
   '1. आवश्यक दस्तावेजों के साथ आधार नामांकन केंद्र पर जाएं।\n2. नामांकन फॉर्म भरें।\n3. बायोमेट्रिक और जनसांख्यिकीय डेटा जमा करें।\n4. नामांकन आईडी के साथ पावती स्लिप प्राप्त करें।\n5. आधार कार्ड 60-90 दिनों के भीतर आपके पते पर भेजा जाता है।',
   '1. आवश्यक कागदपत्रे घेऊन आधार नोंदणी केंद्रात जा.\n2. नोंदणी फॉर्म भरा.\n3. बायोमेट्रिक आणि जनसांख्यिकीय डेटा सबमिट करा.\n4. नोंदणी आयडीसह पावती स्लिप मिळवा.\n5. आधार कार्ड 60-90 दिसांत तुमच्या पत्त्यावर पोहोचते.',
   'https://uidai.gov.in',
   1),

  ('certificates', 'Birth Certificate', 'जन्म प्रमाणपत्र', 'जन्म प्रमाणपत्र',
   'A birth certificate is an official document recording the birth of a person, issued by the Municipal Corporation or Gram Panchayat.',
   'जन्म प्रमाणपत्र एक आधिकारिक दस्तावेज है जो नगर निगम या ग्राम पंचायत द्वारा जारी किया जाता है।',
   'जन्म प्रमाणपत्र हे नगरपालिका किंवा ग्राम पंचायतीने जारी केलेले अधिकृत कागदपत्र आहे.',
   'Any person born in India is eligible. Parents or guardians can apply on behalf of minors.',
   'भारत में जन्म लेने वाला कोई भी व्यक्ति पात्र है। माता-पिता या अभिभावक नाबालिगों की ओर से आवेदन कर सकते हैं।',
   'भारतात जन्मलेला कोणताही व्यक्ती पात्र आहे. पालक किंवा पालकत्व करणारे अप्राप्तवयींच्या वतीने अर्ज करू शकतात.',
   'Hospital birth certificate or discharge summary, Parents identity proof (Aadhaar/Voter ID), Parents marriage certificate (if applicable)',
   'अस्पताल जन्म प्रमाणपत्र या डिस्चार्ज सारांश, माता-पिता का पहचान प्रमाण (आधार/वोटर आईडी), माता-पिता का विवाह प्रमाणपत्र (यदि लागू हो)',
   'रुग्णालय जन्म प्रमाणपत्र किंवा डिस्चार्ज सारांश, पालकांचा ओळख पुरावा (आधार/मतदार ओळखपत्र), पालकांचे लग्न प्रमाणपत्र (जर लागू असेल तर)',
   '1. Collect the hospital birth report.\n2. Visit the Municipal Corporation or Gram Panchayat office.\n3. Fill out the birth registration form.\n4. Submit required documents and pay applicable fees.\n5. Collect the birth certificate after verification.',
   '1. अस्पताल जन्म रिपोर्ट एकत्र करें।\n2. नगर निगम या ग्राम पंचायत कार्यालय जाएं।\n3. जन्म नामांकन फॉर्म भरें।\n4. आवश्यक दस्तावेज जमा करें और लागू शुल्क चुकाएं।\n5. सत्यापन के बाद जन्म प्रमाणपत्र ले लें।',
   '1. रुग्णालय जन्म अहवाल गोळा करा.\n2. नगरपालिका किंवा ग्राम पंचायत कार्यालयात जा.\n3. जन्म नोंदणी फॉर्म भरा.\n4. आवश्यक कागदपत्रे सबमिट करा आणि लागू शुल्क भरा.\n5. पडताळणीनंतर जन्म प्रमाणपत्र घ्या.',
   'https://www.crsorgi.gov.in',
   2),

  ('healthcare', 'Ayushman Bharat Health Card', 'आयुष्मान भारत हेल्थ कार्ड', 'आयुष्मान भारत हेल्थ कार्ड',
   'Ayushman Bharat provides health insurance coverage of up to Rs. 5 lakh per family per year for secondary and tertiary care hospitalization.',
   'आयुष्मान भारत प्रति वर्ष प्रति परिवार 5 लाख रुपये तक का स्वास्थ्य बीमा कवरेज प्रदान करता है।',
   'आयुष्मान भारत दरवर्षी प्रति कुटुंब 5 लाख रुपयांपर्यंतचा आरोग्य विमा कव्हरेज देते.',
   'Families listed in the SECC 2011 database, particularly those from economically weaker sections. Eligibility is based on specific deprivation and occupational criteria.',
   'SECC 2011 डेटाबेस में सूचीबद्ध परिवार, विशेष रूप से आर्थिक रूप से कमजोर वर्गों के। पात्रता विशिष्ट वंचनीयता और व्यावसायिक मानदंड पर आधारित है।',
   'SECC 2011 डेटाबेसमधील कुटुंबे, विशेषतः आर्थिकदृष्ट्या कमकुवत वर्गांची. पात्रता विशिष्ट वंचना आणि व्यावसायिक निकषांवर आधारित आहे.',
   'Aadhaar card, Ration card, Mobile number, Family ID (if available)',
   'आधार कार्ड, राशन कार्ड, मोबाइल नंबर, परिवार आईडी (यदि उपलब्ध हो)',
   'आधार कार्ड, रेशन कार्ड, मोबाइल नंबर, कुटुंब आयडी (जर उपलब्ध असेल तर)',
   '1. Check if your family is listed in the SECC 2011 database at a nearby CSC or hospital.\n2. If eligible, visit an empaneled hospital or CSC center.\n3. Provide Aadhaar and family details for verification.\n4. Get your Ayushman Bharat card issued.\n5. Use the card at any empaneled hospital for cashless treatment.',
   '1. नजदीकी CSC या अस्पताल पर जांचें कि आपका परिवार SECC 2011 डेटाबेस में है या नहीं।\n2. पात्र होने पर, अधिकृत अस्पताल या CSC केंद्र पर जाएं।\n3. सत्यापन के लिए आधार और परिवार विवरण दें।\n4. अपना आयुष्मान भारत कार्ड जारी करवाएं।\n5. कैशलेस इलाज के लिए किसी भी अधिकृत अस्पताल में कार्ड का उपयोग करें।',
   '1. जवळच्या CSC किंवा रुग्णालयात तपासा की तुमचे कुटुंब SECC 2011 डेटाबेसमध्ये आहे का.\n2. पात्र असल्यास, अधिकृत रुग्णालय किंवा CSC केंद्रात जा.\n3. पडताळणीसाठी आधार आणि कुटुंब तपशील द्या.\n4. तुमचे आयुष्मान भारत कार्ड जारी करून घ्या.\n5. कॅशलेस उपचारासाठी कोणत्याही अधिकृत रुग्णालयात कार्ड वापरा.',
   'https://pmjay.gov.in',
   3),

  ('education', 'Scholarship for Students', 'छात्रवृत्ति', 'विद्यार्थी वृत्ती',
   'Various government scholarships are available for students from SC/ST/OBC/minority and economically weaker sections for education from pre-matric to post-graduate levels.',
   'विभिन्न सरकारी छात्रवृत्तियां SC/ST/OBC/अल्पसंख्यक और आर्थिक रूप से कमजोर वर्गों के छात्रों के लिए प्री-मैट्रिक से स्नातकोत्तर स्तर तक शिक्षा के लिए उपलब्ध हैं।',
   'विविध सरकारी वृत्त्या SC/ST/OBC/अल्पसंख्यक आणि आर्थिकदृष्ट्या कमकुवत वर्गांच्या विद्यार्थ्यांसाठी प्री-मॅट्रिकपासून पदव्यापर्यंत शिक्षणासाठी उपलब्ध आहेत.',
   'Students belonging to SC/ST/OBC/minority categories or economically weaker sections. Income criteria vary by scheme. Must be enrolled in a recognized institution.',
   'SC/ST/OBC/अल्पसंख्यक वर्गों या आर्थिक रूप से कमजोर वर्गों के छात्र। आयु मानदंड योजना अनुसार भिन्न है। मान्यता प्राप्त संस्थान में नामांकित होना चाहिए।',
   'SC/ST/OBC/अल्पसंख्यक वर्ग किंवा आर्थिकदृष्ट्या कमकुवत वर्गांचे विद्यार्थी. उत्पन्न निकष योजनेनुसार बदलतात. मान्यताप्राप्त संस्थेत नावनोंदणी असणे आवश्यक.',
   'Caste certificate (if applicable), Income certificate, Previous year marksheet, Aadhaar card, Bank account details, Institution admission proof',
   'जाति प्रमाणपत्र (यदि लागू हो), आय प्रमाणपत्र, पिछले वर्ष की मार्कशीट, आधार कार्ड, बैंक खाता विवरण, संस्थान प्रवेश प्रमाण',
   'जात प्रमाणपत्र (जर लागू असेल), उत्पन्न प्रमाणपत्र, मागील वर्षाची गुणवत्ता पत्रिका, आधार कार्ड, बँक खाते तपशील, संस्था प्रवेश पुरावा',
   '1. Check eligible scholarships on the National Scholarship Portal.\n2. Register and create an account.\n3. Fill in personal and academic details.\n4. Upload required documents.\n5. Submit the application and note the application ID.\n6. Track application status online.',
   '1. राष्ट्रीय छात्रवृत्ति पोर्टल पर पात्र छात्रवृत्तियां देखें।\n2. पंजीकरण करें और खाता बनाएं।\n3. व्यक्तिगत और शैक्षणिक विवरण भरें।\n4. आवश्यक दस्तावेज अपलोड करें।\n5. आवेदन जमा करें और आवेदन आईडी नोट करें।\n6. आवेदन स्थिति ऑनलाइन ट्रैक करें।',
   '1. राष्ट्रीय वृत्ती पोर्टलवर पात्र वृत्त्या तपासा.\n2. नोंदणी करा आणि खाते तयार करा.\n3. वैयक्तिक आणि शैक्षणिक तपशील भरा.\n4. आवश्यक कागदपत्रे अपलोड करा.\n5. अर्ज सबमिट करा आणि अर्ज आयडी नोंद करा.\n6. अर्ज स्थिती ऑनलाइन ट्रॅक करा.',
   'https://scholarships.gov.in',
   4),

  ('employment', 'PMKVY Skill Training', 'PMKVY कौशल प्रशिक्षण', 'PMKVY कौशल प्रशिक्षण',
   'Pradhan Mantri Kaushal Vikas Yojana provides free short-term skill training to youth to make them employable across various sectors.',
   'प्रधानमंत्री कौशल विकास योजना युवाओं को विभिन्न क्षेत्रों में रोजगार योग्य बनाने के लिए मुफ्त अल्पकालिक कौशल प्रशिक्षण प्रदान करती है।',
   'प्रधानमंत्री कौशल विकास योजना तरुणांना विविध क्षेत्रांमध्ये रोजगारक्षम बनवण्यासाठी मोफत अल्पकालीन कौशल प्रशिक्षण देते.',
   'Indian nationals aged 15-45 years, with basic literacy. College dropouts and school leavers are encouraged to apply.',
   '15-45 वर्ष की आयु के भारतीय नागरिक, बुनियादी साक्षरता के साथ। कॉलेज छोड़ने वाले और स्कूल छोड़ने वालों को आवेदन करने के लिए प्रोत्साहित किया जाता है।',
   '15-45 वयोगटीचे भारतीय नागरिक, मूलभूत साक्षरतेसह. कॉलेज सोडणाऱ्या आणि शाळा सोडणाऱ्यांना अर्ज करण्यास प्रोत्साहित केले जाते.',
   'Aadhaar card, Bank account details, Educational qualification certificates, Passport-size photo',
   'आधार कार्ड, बैंक खाता विवरण, शैक्षणिक योग्यता प्रमाणपत्र, पासपोर्ट-साइज फोटो',
   'आधार कार्ड, बँक खाते तपशील, शैक्षणिक पात्रता प्रमाणपत्रे, पासपोर्ट-आकार फोटो',
   '1. Visit the PMKVY website or a nearby training center.\n2. Register with your Aadhaar and personal details.\n3. Choose a skill course from available options.\n4. Attend the training program at the assigned center.\n5. Take the assessment exam.\n6. Receive the skill certificate upon passing.',
   '1. PMKVY वेबसाइट या नजदीकी प्रशिक्षण केंद्र पर जाएं।\n2. अपने आधार और व्यक्तिगत विवरण के साथ पंजीकरण करें।\n3. उपलब्ध विकल्पों में से एक कौशल कोर्स चुनें।\n4. निर्धारित केंद्र पर प्रशिक्षण कार्यक्रम में भाग लें।\n5. मूल्यांकन परीक्षा दें।\n6. उत्तीर्ण होने पर कौशल प्रमाणपत्र प्राप्त करें।',
   '1. PMKVY वेबसाइट किंवा जवळच्या प्रशिक्षण केंद्रात जा.\n2. आधार आणि वैयक्तिक तपशीलासह नोंदणी करा.\n3. उपलब्ध पर्यायांमधून एक कौशल कोर्स निवडा.\n4. नियुक्त केंद्रात प्रशिक्षण कार्यक्रमात सहभागी हो.\n5. मूल्यांकन परीक्षा द्या.\n6. उत्तीर्ण झाल्यावर कौशल प्रमाणपत्र मिळवा.',
   'https://pmkvyofficial.org',
   5)
) AS s(slug, name, name_hi, name_mr, description, description_hi, description_mr, eligibility, eligibility_hi, eligibility_mr, required_documents, required_documents_hi, required_documents_mr, procedure, procedure_hi, procedure_mr, official_link, sort_order)
JOIN categories c ON c.slug = s.slug
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: ANNOUNCEMENTS
-- ============================================================
INSERT INTO announcements (title, title_hi, title_mr, content, content_hi, content_mr, is_active)
VALUES
  ('Welcome to JanSetu', 'जनसेतु में आपका स्वागत है', 'जनसेतुमध्ये आपले स्वागत आहे',
   'JanSetu is an independent platform helping citizens discover and understand government services in simple language.',
   'जनसेतु एक स्वतंत्र मंच है जो नागरिकों को सरल भाषा में सरकारी सेवाओं को खोजने और समझने में मदद करता है।',
   'जनसेतु हे एक स्वतंत्र व्यासपीठ आहे जे नागरिकांना सोप्या भाषेत सरकारी सेवा शोधण्यात आणि समजण्यात मदत करते.',
   true)
ON CONFLICT DO NOTHING;
