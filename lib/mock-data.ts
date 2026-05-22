export type Submission = {
  id: string
  reference_no: string
  created_at: string
  role: 'community_member' | 'business_owner' | 'cseri_rep'
  full_name: string
  email: string
  phone: string
  organisation: string
  challenge_title: string
  challenge_description: string
  category: string
  province: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  proposed_solution: string
  background_info: string
  suits_intl_students: boolean
  language_used: string
  popia_consent: boolean
  status: 'new' | 'reviewing' | 'matched' | 'closed'
}

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: '1', reference_no: 'CSERI-2026-00001', created_at: '2026-05-10T08:23:00Z',
    role: 'community_member', full_name: 'Sipho Dlamini', email: 'sipho@gmail.com',
    phone: '071 234 5678', organisation: '',
    challenge_title: 'Lack of clean water access in Umlazi',
    challenge_description: 'Residents in section K of Umlazi have been without running water for 3 months. We rely on a single communal tap shared by over 200 households.',
    category: 'health', province: 'kzn', urgency: 'critical',
    proposed_solution: 'Emergency water tanker deployment and repair of main pipeline',
    background_info: 'The municipality has been notified multiple times with no response.',
    suits_intl_students: true, language_used: 'en', popia_consent: true, status: 'new',
  },
  {
    id: '2', reference_no: 'CSERI-2026-00002', created_at: '2026-05-11T10:45:00Z',
    role: 'business_owner', full_name: 'Fatima Moosa', email: 'fatima@moosafashion.co.za',
    phone: '082 345 6789', organisation: 'Moosa Fashion Design',
    challenge_title: 'Digital marketing skills gap for township SMMEs',
    challenge_description: 'Most small businesses in our area cannot afford digital marketing agencies and do not have the skills to market themselves online.',
    category: 'technology', province: 'gp', urgency: 'high',
    proposed_solution: 'Low-cost digital marketing training workshops for SMME owners',
    background_info: 'I have been in business for 5 years and rely entirely on word of mouth.',
    suits_intl_students: true, language_used: 'en', popia_consent: true, status: 'reviewing',
  },
  {
    id: '3', reference_no: 'CSERI-2026-00003', created_at: '2026-05-12T14:00:00Z',
    role: 'community_member', full_name: 'Thabo Nkosi', email: '',
    phone: '063 456 7890', organisation: 'Soweto Community Forum',
    challenge_title: 'Youth unemployment in Soweto',
    challenge_description: 'Over 60% of youth aged 18-35 in our ward are unemployed. There are no nearby factories or offices and transportation costs prevent travel to the CBD.',
    category: 'employment', province: 'gp', urgency: 'high',
    proposed_solution: 'Establish a local skills training centre focused on artisan trades',
    background_info: '',
    suits_intl_students: false, language_used: 'zu', popia_consent: true, status: 'matched',
  },
  {
    id: '4', reference_no: 'CSERI-2026-00004', created_at: '2026-05-13T09:15:00Z',
    role: 'business_owner', full_name: 'Maria van der Merwe', email: 'maria@freshproduce.co.za',
    phone: '084 567 8901', organisation: 'Fresh Produce Direct',
    challenge_title: 'Cold chain logistics gap for small-scale farmers',
    challenge_description: 'Small-scale farmers in the Western Cape cannot afford refrigerated transport, causing significant post-harvest losses.',
    category: 'agriculture', province: 'wc', urgency: 'medium',
    proposed_solution: 'Shared refrigerated logistics cooperative for small farmers',
    background_info: 'We lose up to 30% of produce before it reaches markets.',
    suits_intl_students: true, language_used: 'af', popia_consent: true, status: 'reviewing',
  },
  {
    id: '5', reference_no: 'CSERI-2026-00005', created_at: '2026-05-14T11:30:00Z',
    role: 'community_member', full_name: 'Nomvula Sithole', email: 'nomvula.s@yahoo.com',
    phone: '076 678 9012', organisation: '',
    challenge_title: 'No early childhood development centres in rural Limpopo',
    challenge_description: 'Children under 5 in our village have no access to ECD facilities. The nearest centre is 45km away with no public transport.',
    category: 'education', province: 'lp', urgency: 'high',
    proposed_solution: 'Community-run ECD centre using existing church hall',
    background_info: 'The church hall is available and willing to host.',
    suits_intl_students: false, language_used: 'nso', popia_consent: true, status: 'new',
  },
  {
    id: '6', reference_no: 'CSERI-2026-00006', created_at: '2026-05-15T08:00:00Z',
    role: 'business_owner', full_name: 'Lungelo Zulu', email: 'lungelo@zuluconstruct.co.za',
    phone: '071 789 0123', organisation: 'Zulu Construction',
    challenge_title: 'Access to construction contracts for black-owned SMMEs',
    challenge_description: 'Despite BEE legislation, most government construction contracts go to large firms. Small black-owned contractors cannot meet the bonding and insurance requirements.',
    category: 'finance', province: 'kzn', urgency: 'medium',
    proposed_solution: 'Collective bonding scheme for SMME contractors',
    background_info: 'We have the skills but not the capital to qualify for tenders.',
    suits_intl_students: false, language_used: 'en', popia_consent: true, status: 'new',
  },
  {
    id: '7', reference_no: 'CSERI-2026-00007', created_at: '2026-05-16T13:00:00Z',
    role: 'community_member', full_name: 'Priya Naidoo', email: 'priya.naidoo@webmail.co.za',
    phone: '082 890 1234', organisation: 'Phoenix Residents Association',
    challenge_title: 'Flooding of homes in Phoenix after heavy rain',
    challenge_description: 'Approximately 120 homes in Phoenix flood every rainy season due to inadequate stormwater drainage installed in the 1970s.',
    category: 'housing', province: 'kzn', urgency: 'critical',
    proposed_solution: 'Engineering assessment and upgrade of stormwater infrastructure',
    background_info: 'Residents have been raising this with eThekwini Municipality since 2019.',
    suits_intl_students: true, language_used: 'en', popia_consent: true, status: 'reviewing',
  },
  {
    id: '8', reference_no: 'CSERI-2026-00008', created_at: '2026-05-17T10:00:00Z',
    role: 'business_owner', full_name: 'Andile Khumalo', email: 'andile@ecorecycle.co.za',
    phone: '065 901 2345', organisation: 'EcoRecycle SA',
    challenge_title: 'No formal recycling infrastructure in townships',
    challenge_description: 'Township communities generate significant recyclable waste but there is no structured collection. Informal reclaimers work in dangerous conditions.',
    category: 'environment', province: 'ec', urgency: 'low',
    proposed_solution: 'Formalise and support reclaimer cooperatives with collection routes',
    background_info: 'We have piloted this model in 2 streets with positive results.',
    suits_intl_students: true, language_used: 'xh', popia_consent: true, status: 'closed',
  },
]
