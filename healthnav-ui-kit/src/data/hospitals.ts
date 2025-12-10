export interface Hospital {
  id: string;
  cmsId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  hcahpsScore: number;
  lat: number;
  lng: number;
  phone?: string;              // Made optional to match backend
  about?: string;              // Made optional to match backend
  affiliatedProviders: number;
  bedCount?: number;           // Made optional to match backend
  emergencyServices: boolean;
}

export const hospitals: Hospital[] = [
  {
    id: "hosp-001",
    cmsId: "330101",
    name: "Metro General Hospital",
    address: "123 Medical Plaza",
    city: "New York",
    state: "NY",
    zipCode: "10019",
    hcahpsScore: 87,
    lat: 40.7589,
    lng: -73.9851,
    phone: "(555) 100-1000",
    about: "Metro General Hospital is a leading academic medical center providing comprehensive healthcare services. With over 500 beds and state-of-the-art facilities, we serve the greater metropolitan area with excellence in patient care.",
    affiliatedProviders: 45,
    bedCount: 520,
    emergencyServices: true,
  },
  {
    id: "hosp-002",
    cmsId: "330102",
    name: "City Medical Center",
    address: "456 Health Avenue",
    city: "New York",
    state: "NY",
    zipCode: "10022",
    hcahpsScore: 92,
    lat: 40.7614,
    lng: -73.9776,
    phone: "(555) 200-2000",
    about: "City Medical Center is recognized nationally for clinical excellence and innovative care. Our multidisciplinary teams work together to deliver personalized treatment plans for every patient.",
    affiliatedProviders: 62,
    bedCount: 680,
    emergencyServices: true,
  },
  {
    id: "hosp-003",
    cmsId: "330103",
    name: "University Health System",
    address: "789 University Boulevard",
    city: "New York",
    state: "NY",
    zipCode: "10028",
    hcahpsScore: 78,
    lat: 40.7680,
    lng: -73.9655,
    phone: "(555) 300-3000",
    about: "University Health System combines cutting-edge research with compassionate patient care. As a teaching hospital, we train the next generation of healthcare professionals while advancing medical science.",
    affiliatedProviders: 38,
    bedCount: 450,
    emergencyServices: true,
  },
  {
    id: "hosp-004",
    cmsId: "330104",
    name: "Westside Community Hospital",
    address: "321 Community Drive",
    city: "New York",
    state: "NY",
    zipCode: "10023",
    hcahpsScore: 85,
    lat: 40.7450,
    lng: -73.9950,
    phone: "(555) 400-4000",
    about: "Westside Community Hospital is dedicated to serving our local community with accessible, high-quality healthcare. We pride ourselves on our patient-centered approach and community engagement.",
    affiliatedProviders: 28,
    bedCount: 280,
    emergencyServices: true,
  },
  {
    id: "hosp-005",
    cmsId: "330105",
    name: "Eastside Medical Pavilion",
    address: "555 Pavilion Way",
    city: "New York",
    state: "NY",
    zipCode: "10021",
    hcahpsScore: 90,
    lat: 40.7480,
    lng: -73.9700,
    phone: "(555) 500-5000",
    about: "Eastside Medical Pavilion offers specialized care in a modern, patient-friendly environment. Our focus on innovation and quality has earned us recognition as a top healthcare destination.",
    affiliatedProviders: 35,
    bedCount: 350,
    emergencyServices: true,
  },
  {
    id: "hosp-006",
    cmsId: "330106",
    name: "Midtown Specialty Hospital",
    address: "222 Specialty Lane",
    city: "New York",
    state: "NY",
    zipCode: "10016",
    hcahpsScore: 88,
    lat: 40.7484,
    lng: -73.9857,
    phone: "(555) 600-6000",
    about: "Midtown Specialty Hospital focuses on complex medical cases requiring specialized expertise. Our team of renowned specialists provides advanced care for challenging conditions.",
    affiliatedProviders: 22,
    bedCount: 200,
    emergencyServices: false,
  },
  {
    id: "hosp-007",
    cmsId: "330107",
    name: "Harbor View Medical Center",
    address: "888 Harbor Road",
    city: "New York",
    state: "NY",
    zipCode: "10038",
    hcahpsScore: 82,
    lat: 40.7128,
    lng: -74.0060,
    phone: "(555) 700-7000",
    about: "Harbor View Medical Center serves the downtown and waterfront communities with comprehensive healthcare services. Our convenient location and extended hours make healthcare accessible.",
    affiliatedProviders: 30,
    bedCount: 320,
    emergencyServices: true,
  },
  {
    id: "hosp-008",
    cmsId: "330108",
    name: "Northside Regional Hospital",
    address: "999 Northern Boulevard",
    city: "New York",
    state: "NY",
    zipCode: "10029",
    hcahpsScore: 75,
    lat: 40.7900,
    lng: -73.9500,
    phone: "(555) 800-8000",
    about: "Northside Regional Hospital is a community-focused facility providing essential healthcare services to the northern metropolitan area. We emphasize preventive care and community wellness.",
    affiliatedProviders: 25,
    bedCount: 260,
    emergencyServices: true,
  },
];

export function getHcahpsColor(score: number): string {
  if (score >= 90) return "excellent";
  if (score >= 80) return "good";
  if (score >= 70) return "average";
  return "poor";
}

export function getHcahpsLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Average";
  return "Below Average";
}
