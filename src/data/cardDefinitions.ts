export type CardId = 'csp' | 'amex_gold' | 'amex_platinum' | 'venture_x'
export type Cadence = 'annual' | 'monthly' | 'semi_annual'

export interface EarningRate {
  category: string
  multiplier: number
  note?: string
}

export interface BenefitDef {
  id: string
  name: string
  amount: number
  cadence: Cadence
  description: string
  resetMonth?: number // undefined = Dec 31 annually; 1-12 = month number for monthly
}

export interface CardDef {
  id: CardId
  name: string
  shortName: string
  annualFee: number
  network: 'visa' | 'mastercard' | 'amex'
  pointsCurrency: string
  gradient: string // tailwind gradient classes
  earningRates: EarningRate[]
  benefits: BenefitDef[]
}

export const CARDS: CardDef[] = [
  {
    id: 'csp',
    name: 'Chase Sapphire Preferred',
    shortName: 'CSP',
    annualFee: 95,
    network: 'visa',
    pointsCurrency: 'Chase Ultimate Rewards',
    gradient: 'from-blue-700 via-blue-600 to-indigo-700',
    earningRates: [
      { category: 'Travel (Chase Portal)', multiplier: 5 },
      { category: 'Dining', multiplier: 3 },
      { category: 'Online Groceries', multiplier: 3, note: 'Excludes Target, Walmart, wholesale clubs' },
      { category: 'Streaming', multiplier: 3 },
      { category: 'Travel', multiplier: 2 },
      { category: 'Everything Else', multiplier: 1 },
    ],
    benefits: [
      {
        id: 'csp_hotel_credit',
        name: 'Hotel Credit',
        amount: 50,
        cadence: 'annual',
        description: '$50 annual hotel credit via Chase Travel portal',
      },
    ],
  },
  {
    id: 'amex_gold',
    name: 'Amex Gold Card',
    shortName: 'Gold',
    annualFee: 250,
    network: 'amex',
    pointsCurrency: 'Amex Membership Rewards',
    gradient: 'from-yellow-600 via-amber-500 to-yellow-400',
    earningRates: [
      { category: 'Dining', multiplier: 4 },
      { category: 'US Supermarkets', multiplier: 4, note: 'Up to $25,000/year, then 1x' },
      { category: 'Flights (Direct/Amex Travel)', multiplier: 3 },
      { category: 'Everything Else', multiplier: 1 },
    ],
    benefits: [
      {
        id: 'amex_gold_uber_cash',
        name: 'Uber Cash',
        amount: 10,
        cadence: 'monthly',
        description: '$10/month Uber Cash for Uber Eats or Rides (US only)',
      },
      {
        id: 'amex_gold_dining_credit',
        name: 'Dining Credit',
        amount: 10,
        cadence: 'monthly',
        description: '$10/month at Grubhub, Cheesecake Factory, Goldbelly, Wine.com, Five Guys, Milk Bar',
      },
      {
        id: 'amex_gold_hotel_credit',
        name: 'Hotel Credit',
        amount: 100,
        cadence: 'annual',
        description: '$100 hotel credit on eligible bookings via Amex Travel (2-night minimum)',
      },
    ],
  },
  {
    id: 'amex_platinum',
    name: 'Amex Platinum Card',
    shortName: 'Platinum',
    annualFee: 695,
    network: 'amex',
    pointsCurrency: 'Amex Membership Rewards',
    gradient: 'from-slate-400 via-gray-300 to-slate-500',
    earningRates: [
      { category: 'Flights (Direct/Amex Travel)', multiplier: 5, note: 'Up to $500,000/year' },
      { category: 'Prepaid Hotels (Amex Travel)', multiplier: 5 },
      { category: 'Everything Else', multiplier: 1 },
    ],
    benefits: [
      {
        id: 'amex_plat_airline_fee',
        name: 'Airline Fee Credit',
        amount: 200,
        cadence: 'annual',
        description: '$200 airline fee credit (1 selected airline per year)',
      },
      {
        id: 'amex_plat_hotel_credit',
        name: 'Hotel Credit (FHR)',
        amount: 200,
        cadence: 'annual',
        description: '$200 hotel credit for Fine Hotels + Resorts or Hotel Collection',
      },
      {
        id: 'amex_plat_uber_cash',
        name: 'Uber Cash',
        amount: 15,
        cadence: 'monthly',
        description: '$15/month Uber Cash ($35 in December)',
      },
      {
        id: 'amex_plat_digital',
        name: 'Digital Entertainment',
        amount: 20,
        cadence: 'monthly',
        description: '$20/month for Disney+, Hulu, ESPN+, Peacock, NYT, WSJ, etc.',
      },
      {
        id: 'amex_plat_walmart',
        name: 'Walmart+ Credit',
        amount: 155,
        cadence: 'annual',
        description: '$12.95/month Walmart+ membership credit',
      },
      {
        id: 'amex_plat_clear',
        name: 'CLEAR Plus Credit',
        amount: 189,
        cadence: 'annual',
        description: '$189 CLEAR Plus membership credit',
      },
      {
        id: 'amex_plat_equinox',
        name: 'Equinox Credit',
        amount: 300,
        cadence: 'annual',
        description: '$300 Equinox gym membership credit',
      },
      {
        id: 'amex_plat_saks_h1',
        name: 'Saks Fifth Avenue (Jan–Jun)',
        amount: 50,
        cadence: 'semi_annual',
        description: '$50 Saks Fifth Avenue credit (January–June)',
      },
      {
        id: 'amex_plat_saks_h2',
        name: 'Saks Fifth Avenue (Jul–Dec)',
        amount: 50,
        cadence: 'semi_annual',
        description: '$50 Saks Fifth Avenue credit (July–December)',
      },
    ],
  },
  {
    id: 'venture_x',
    name: 'Capital One Venture X',
    shortName: 'Venture X',
    annualFee: 395,
    network: 'visa',
    pointsCurrency: 'Capital One Miles',
    gradient: 'from-slate-800 via-slate-700 to-teal-800',
    earningRates: [
      { category: 'Hotels (Capital One Travel)', multiplier: 10 },
      { category: 'Rental Cars (Capital One Travel)', multiplier: 10 },
      { category: 'Flights (Capital One Travel)', multiplier: 5 },
      { category: 'Everything Else', multiplier: 2 },
    ],
    benefits: [
      {
        id: 'venture_x_travel_credit',
        name: 'Travel Credit',
        amount: 300,
        cadence: 'annual',
        description: '$300 annual travel credit for Capital One Travel bookings',
      },
    ],
  },
]

export const CARD_MAP = Object.fromEntries(CARDS.map((c) => [c.id, c])) as Record<CardId, CardDef>

// Category → best card optimizer
export interface CardRecommendation {
  card: CardDef
  multiplier: number
  note?: string
}

const CATEGORY_RULES: Array<{
  keywords: string[]
  rankings: Array<{ cardId: CardId; multiplier: number; note?: string }>
}> = [
  {
    keywords: ['flight', 'airline', 'airways', 'air ', 'delta', 'united', 'american airlines', 'southwest', 'jetblue', 'lufthansa'],
    rankings: [
      { cardId: 'amex_platinum', multiplier: 5, note: 'Book direct or via Amex Travel' },
      { cardId: 'amex_gold', multiplier: 3, note: 'Book direct or via Amex Travel' },
      { cardId: 'venture_x', multiplier: 5, note: 'Book via Capital One Travel' },
      { cardId: 'csp', multiplier: 5, note: 'Book via Chase Travel' },
    ],
  },
  {
    keywords: ['hotel', 'marriott', 'hilton', 'hyatt', 'airbnb', 'vrbo', 'inn', 'resort', 'lodging'],
    rankings: [
      { cardId: 'venture_x', multiplier: 10, note: 'Book via Capital One Travel' },
      { cardId: 'amex_platinum', multiplier: 5, note: 'Book via Amex Travel' },
      { cardId: 'csp', multiplier: 5, note: 'Book via Chase Travel' },
    ],
  },
  {
    keywords: ['restaurant', 'dining', 'food', 'cafe', 'pizza', 'burger', 'sushi', 'thai', 'mexican', 'italian', 'doordash', 'grubhub', 'ubereats', 'uber eats', 'delivery'],
    rankings: [
      { cardId: 'amex_gold', multiplier: 4 },
      { cardId: 'csp', multiplier: 3 },
    ],
  },
  {
    keywords: ['grocery', 'groceries', 'supermarket', 'whole foods', 'trader joe', 'safeway', 'kroger', 'publix', 'sprouts', 'wegmans'],
    rankings: [
      { cardId: 'amex_gold', multiplier: 4, note: 'US supermarkets up to $25k/year' },
      { cardId: 'csp', multiplier: 3, note: 'Online groceries only' },
    ],
  },
  {
    keywords: ['streaming', 'netflix', 'hulu', 'spotify', 'apple tv', 'disney+', 'hbo', 'peacock', 'paramount', 'youtube premium'],
    rankings: [{ cardId: 'csp', multiplier: 3 }],
  },
  {
    keywords: ['uber', 'lyft', 'ride'],
    rankings: [
      { cardId: 'amex_gold', multiplier: 1, note: 'Use Uber Cash credit first' },
      { cardId: 'amex_platinum', multiplier: 1, note: 'Use Uber Cash credit first' },
      { cardId: 'venture_x', multiplier: 2 },
    ],
  },
  {
    keywords: ['rental car', 'rent a car', 'hertz', 'enterprise', 'avis', 'budget', 'national car'],
    rankings: [
      { cardId: 'venture_x', multiplier: 10, note: 'Book via Capital One Travel' },
      { cardId: 'csp', multiplier: 2, note: 'Earns travel rate + primary CDW insurance' },
    ],
  },
  {
    keywords: ['travel', 'transit', 'train', 'amtrak', 'bus', 'parking', 'toll', 'cruise'],
    rankings: [
      { cardId: 'csp', multiplier: 2 },
      { cardId: 'venture_x', multiplier: 2 },
    ],
  },
]

export function getCardRecommendations(query: string): CardRecommendation[] {
  const q = query.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((k) => q.includes(k))) {
      return rule.rankings.map(({ cardId, multiplier, note }) => ({
        card: CARD_MAP[cardId],
        multiplier,
        note,
      }))
    }
  }
  // Default: everything else → Venture X 2x
  return [
    { card: CARD_MAP['venture_x'], multiplier: 2, note: 'Best catch-all card' },
    { card: CARD_MAP['csp'], multiplier: 1 },
  ]
}
