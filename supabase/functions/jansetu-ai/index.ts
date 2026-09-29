import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ServiceInfo {
  name: string;
  name_hi: string;
  name_mr: string;
  description: string;
  description_hi: string;
  description_mr: string;
  eligibility: string;
  required_documents: string;
  procedure: string;
  official_link: string;
  category: string;
}

const SERVICES: ServiceInfo[] = [
  {
    name: "Aadhaar Card",
    name_hi: "आधार कार्ड",
    name_mr: "आधार कार्ड",
    description: "Aadhaar is a 12-digit unique identity number issued by UIDAI to all residents of India.",
    description_hi: "आधार भारत के सभी निवासियों के लिए UIDAI द्वारा जारी 12-अंकों का एक विशिष्ट पहचान नंबर है।",
    description_mr: "आधार हे UIDAI द्वारे भारतातील सर्व रहिवासीांसाठी जारी केलेला 12-अंकी अद्वितीय ओळख नंबर आहे.",
    eligibility: "All residents of India, including newborns. No age limit.",
    required_documents: "Proof of identity, Proof of address, Proof of date of birth, Biometric data",
    procedure: "1. Visit an Aadhaar enrollment center with required documents. 2. Fill out the enrollment form. 3. Submit biometric and demographic data. 4. Receive acknowledgment slip. 5. Aadhaar card delivered within 60-90 days.",
    official_link: "https://uidai.gov.in",
    category: "Certificates",
  },
  {
    name: "Birth Certificate",
    name_hi: "जन्म प्रमाणपत्र",
    name_mr: "जन्म प्रमाणपत्र",
    description: "A birth certificate is an official document recording the birth of a person, issued by the Municipal Corporation or Gram Panchayat.",
    description_hi: "जन्म प्रमाणपत्र एक आधिकारिक दस्तावेज है जो नगर निगम या ग्राम पंचायत द्वारा जारी किया जाता है।",
    description_mr: "जन्म प्रमाणपत्र हे नगरपालिका किंवा ग्राम पंचायतीने जारी केलेले अधिकृत कागदपत्र आहे.",
    eligibility: "Any person born in India. Parents or guardians can apply on behalf of minors.",
    required_documents: "Hospital birth certificate, Parents identity proof, Parents marriage certificate (if applicable)",
    procedure: "1. Collect the hospital birth report. 2. Visit the Municipal Corporation or Gram Panchayat office. 3. Fill out the birth registration form. 4. Submit required documents and pay fees. 5. Collect the birth certificate after verification.",
    official_link: "https://www.crsorgi.gov.in",
    category: "Certificates",
  },
  {
    name: "Ayushman Bharat Health Card",
    name_hi: "आयुष्मान भारत हेल्थ कार्ड",
    name_mr: "आयुष्मान भारत हेल्थ कार्ड",
    description: "Ayushman Bharat provides health insurance coverage of up to Rs. 5 lakh per family per year for secondary and tertiary care hospitalization.",
    description_hi: "आयुष्मान भारत प्रति वर्ष प्रति परिवार 5 लाख रुपये तक का स्वास्थ्य बीमा कवरेज प्रदान करता है।",
    description_mr: "आयुष्मान भारत दरवर्षी प्रति कुटुंब 5 लाख रुपयांपर्यंतचा आरोग्य विमा कव्हरेज देते.",
    eligibility: "Families listed in the SECC 2011 database, particularly from economically weaker sections.",
    required_documents: "Aadhaar card, Ration card, Mobile number, Family ID (if available)",
    procedure: "1. Check if your family is listed in SECC 2011 database. 2. Visit an empaneled hospital or CSC center. 3. Provide Aadhaar and family details. 4. Get your Ayushman Bharat card issued. 5. Use the card at any empaneled hospital for cashless treatment.",
    official_link: "https://pmjay.gov.in",
    category: "Healthcare",
  },
  {
    name: "Scholarship for Students",
    name_hi: "छात्रवृत्ति",
    name_mr: "विद्यार्थी वृत्ती",
    description: "Various government scholarships for students from SC/ST/OBC/minority and economically weaker sections.",
    description_hi: "विभिन्न सरकारी छात्रवृत्तियां SC/ST/OBC/अल्पसंख्यक और आर्थिक रूप से कमजोर वर्गों के छात्रों के लिए उपलब्ध हैं।",
    description_mr: "विविध सरकारी वृत्त्या SC/ST/OBC/अल्पसंख्यक आणि आर्थिकदृष्ट्या कमकुवत वर्गांच्या विद्यार्थ्यांसाठी उपलब्ध आहेत.",
    eligibility: "Students belonging to SC/ST/OBC/minority categories or economically weaker sections. Income criteria vary by scheme.",
    required_documents: "Caste certificate, Income certificate, Previous year marksheet, Aadhaar card, Bank account details, Institution admission proof",
    procedure: "1. Check eligible scholarships on the National Scholarship Portal. 2. Register and create an account. 3. Fill in personal and academic details. 4. Upload required documents. 5. Submit the application. 6. Track application status online.",
    official_link: "https://scholarships.gov.in",
    category: "Education",
  },
  {
    name: "PMKVY Skill Training",
    name_hi: "PMKVY कौशल प्रशिक्षण",
    name_mr: "PMKVY कौशल प्रशिक्षण",
    description: "Pradhan Mantri Kaushal Vikas Yojana provides free short-term skill training to youth to make them employable.",
    description_hi: "प्रधानमंत्री कौशल विकास योजना युवाओं को मुफ्त अल्पकालिक कौशल प्रशिक्षण प्रदान करती है।",
    description_mr: "प्रधानमंत्री कौशल विकास योजना तरुणांना मोफत अल्पकालीन कौशल प्रशिक्षण देते.",
    eligibility: "Indian nationals aged 15-45 years with basic literacy. College dropouts and school leavers are encouraged to apply.",
    required_documents: "Aadhaar card, Bank account details, Educational qualification certificates, Passport-size photo",
    procedure: "1. Visit the PMKVY website or a nearby training center. 2. Register with Aadhaar and personal details. 3. Choose a skill course. 4. Attend the training program. 5. Take the assessment exam. 6. Receive the skill certificate upon passing.",
    official_link: "https://pmkvyofficial.org",
    category: "Employment",
  },
];

function findRelevantService(message: string): ServiceInfo | null {
  const lower = message.toLowerCase();
  for (const s of SERVICES) {
    const allTerms = [
      s.name, s.name_hi, s.name_mr, s.category,
      s.description, s.eligibility,
    ].join(" ").toLowerCase();
    const keywords = lower.split(/\s+/).filter((w) => w.length > 3);
    for (const kw of keywords) {
      if (allTerms.includes(kw)) return s;
    }
  }
  return null;
}

function buildReply(message: string, language: string): string {
  const isHindi = language === "hi";
  const isMarathi = language === "mr";
  const lower = message.toLowerCase();

  // Check for greetings
  if (/^(hi|hello|hey|namaste|namaskar|नमस्ते|नमस्कार|हाय)/i.test(lower)) {
    if (isHindi) return "नमस्ते! मैं जनसेतु AI हूं। मैं आपको सरकारी सेवाओं के बारे में जानकारी दे सकता हूं। आप क्या जानना चाहते हैं?";
    if (isMarathi) return "नमस्कार! मी जनसेतु AI आहे. मी तुम्हाला सरकारी सेवांबद्दल माहिती देऊ शकतो. तुम्हाला काय जाणून घ्यायचे आहे?";
    return "Hello! I'm JanSetu AI. I can help you with information about government services. What would you like to know?";
  }

  // Check for available services
  if (lower.includes("available") || lower.includes("what service") || lower.includes("list") || lower.includes("कौन सी") || lower.includes("कोणत्या")) {
    const names = SERVICES.map((s) => {
      if (isHindi) return s.name_hi;
      if (isMarathi) return s.name_mr;
      return s.name;
    }).join(", ");
    if (isHindi) return `उपलब्ध सेवाएं: ${names}। आप किसी भी सेवा के बारे में विस्तार से जान सकते हैं।`;
    if (isMarathi) return `उपलब्ध सेवा: ${names}। तुम्ही कोणत्याही सेवेबद्दल तपशीलवार जाणून घेऊ शकता.`;
    return `Available services: ${names}. You can ask about any of these for more details.`;
  }

  // Find relevant service
  const service = findRelevantService(message);
  if (service) {
    const name = isHindi ? service.name_hi : isMarathi ? service.name_mr : service.name;
    const desc = isHindi ? service.description_hi : isMarathi ? service.description_mr : service.description;

    if (lower.includes("eligible") || lower.includes("eligibility") || lower.includes("पात्र") || lower.includes("पात्रता")) {
      if (isHindi) return `${name} के लिए पात्रता: ${service.eligibility}`;
      if (isMarathi) return `${name} साठी पात्रता: ${service.eligibility}`;
      return `Eligibility for ${name}: ${service.eligibility}`;
    }

    if (lower.includes("document") || lower.includes("दस्तावेज") || lower.includes("कागदपत्र")) {
      if (isHindi) return `${name} के लिए आवश्यक दस्तावेज: ${service.required_documents}`;
      if (isMarathi) return `${name} साठी आवश्यक कागदपत्रे: ${service.required_documents}`;
      return `Required documents for ${name}: ${service.required_documents}`;
    }

    if (lower.includes("apply") || lower.includes("how") || lower.includes("कैसे") || lower.includes("कसा") || lower.includes("प्रक्रिया") || lower.includes("procedure")) {
      if (isHindi) return `${name} के लिए आवेदन प्रक्रिया:\n${service.procedure}`;
      if (isMarathi) return `${name} साठी अर्ज प्रक्रिया:\n${service.procedure}`;
      return `How to apply for ${name}:\n${service.procedure}`;
    }

    // Default: give overview
    if (isHindi) return `${name}: ${desc}\n\nपात्रता: ${service.eligibility}\n\nअधिक जानकारी के लिए: ${service.official_link}`;
    if (isMarathi) return `${name}: ${desc}\n\nपात्रता: ${service.eligibility}\n\nअधिक माहितीसाठी: ${service.official_link}`;
    return `${name}: ${desc}\n\nEligibility: ${service.eligibility}\n\nFor more info visit: ${service.official_link}`;
  }

  // Fallback
  if (isHindi) return "मैं सरकारी सेवाओं के बारे में जानकारी दे सकता हूं। आप आधार कार्ड, जन्म प्रमाणपत्र, आयुष्मान भारत, छात्रवृत्ति, या PMKVY कौशल प्रशिक्षण के बारे में पूछ सकते हैं।";
  if (isMarathi) return "मी सरकारी सेवांबद्दल माहिती देऊ शकतो. तुम्ही आधार कार्ड, जन्म प्रमाणपत्र, आयुष्मान भारत, वृत्ती, किंवा PMKVY कौशल प्रशिक्षण विषयी विचारू शकता.";
  return "I can help you with information about government services. You can ask about Aadhaar Card, Birth Certificate, Ayushman Bharat, Scholarships, or PMKVY Skill Training.";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, language } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reply = buildReply(message, language || "en");

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
