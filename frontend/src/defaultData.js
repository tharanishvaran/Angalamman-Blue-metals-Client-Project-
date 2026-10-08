// defaultData.js — Instant local fallback data for zero-latency, zero-blank page rendering

export const DEFAULT_SETTINGS = {
  business_name: 'Sri Angalamman Blue Metals',
  tagline: 'Quality Materials for a Stronger Tomorrow',
  headline: 'Quality Blue Metals & Construction Materials',
  subheadline: 'Reliable construction materials and transportation services in Puducherry.',
  address: 'Kalathumettu Veedhi, Sathiyamoorthy Nagar, Thilaspettai, Puducherry - 605009',
  phone_primary: '9944076675',
  phone_secondary: '9345009337',
  phone_additional: '9629657833',
  whatsapp_number: '9944076675',
  email: 'contact@sriangalammanbluemetals.com',
  maps_url: 'https://maps.app.goo.gl/Z4SS6rkY7Vknzc3SA',
  operating_hours: 'Mon - Sat: 6:00 AM - 8:00 PM | Sun: 7:00 AM - 1:00 PM',
  hero_image: '/images/hero.jpg',
  about_image: '/images/about.jpg',
  vehicle_tractor_image: '/images/tractor_trolley.jpg',
  vehicle_tipper_image: '/images/fleet.jpg',
  vehicle_lorry_image: '/images/heavy_tipper.jpg',
  logo_text: 'Sri Angalamman Blue Metals'
};

export const DEFAULT_MATERIALS = [
  {
    id: 1,
    name: 'M-Sand (Manufactured Sand)',
    category: 'Sand',
    description: 'Triple-washed manufactured sand with zero silt and uniform cubical grading. Ideal for reinforced concrete and structural slabs.',
    price: 4800,
    unit: 'Load',
    image_url: '/images/msand.jpg',
    available: 1,
    display_order: 1
  },
  {
    id: 2,
    name: 'P-Sand (Plastering Sand)',
    category: 'Sand',
    description: 'Super-fine micro-sieved sand engineered for flawless interior and exterior wall plastering. Prevents shrinkage cracks.',
    price: 5200,
    unit: 'Load',
    image_url: '/images/psand.jpg',
    available: 1,
    display_order: 2
  },
  {
    id: 3,
    name: 'River Sand (Aatrumanal)',
    category: 'Sand',
    description: 'Natural riverbed sand with high silica purity, verified grain distribution, and superior workability.',
    price: 6500,
    unit: 'Load',
    image_url: '/images/riversand.jpg',
    available: 1,
    display_order: 3
  },
  {
    id: 4,
    name: 'Sengal (Red Clay Bricks)',
    category: 'Bricks',
    description: 'Kiln-fired high-density red clay bricks offering high compressive load strength and optimal thermal insulation.',
    price: 9,
    unit: 'Piece',
    image_url: '/images/sengal.jpg',
    available: 1,
    display_order: 4
  },
  {
    id: 5,
    name: '1/4" Stone (6mm Chips)',
    category: 'Aggregates',
    description: 'Machine-crushed 6mm blue metal chips suitable for asphalt mixing, paver block base layer, and concrete flooring screed.',
    price: 3600,
    unit: 'Load',
    image_url: '/images/stone_quarter.jpg',
    available: 1,
    display_order: 5
  },
  {
    id: 6,
    name: '1/2" Stone (12mm Blue Metal)',
    category: 'Aggregates',
    description: 'Clean 12mm crushed granite aggregates for lintels, precast concrete components, and thin-section RCC structures.',
    price: 4200,
    unit: 'Load',
    image_url: '/images/stone_half.jpg',
    available: 1,
    display_order: 6
  },
  {
    id: 7,
    name: '3/4" Stone (20mm Blue Metal)',
    category: 'Aggregates',
    description: 'Standard 20mm cubical blue metal aggregates. The primary specification for columns, beams, footings, and roof slabs.',
    price: 4400,
    unit: 'Load',
    image_url: '/images/stone_three_quarter.jpg',
    available: 1,
    display_order: 7
  },
  {
    id: 8,
    name: '1 1/2" Stone (40mm Blue Metal)',
    category: 'Aggregates',
    description: 'Heavy 40mm crushed granite ballast for foundation plain cement concrete (PCC), road sub-base, and retaining walls.',
    price: 3800,
    unit: 'Load',
    image_url: '/images/stone_one_half.jpg',
    available: 1,
    display_order: 8
  },
  {
    id: 9,
    name: 'Gravel / Kraval Soil',
    category: 'Base Material',
    description: 'Naturally graded gravel and kraval material suitable for sub-base road compaction, site leveling, and plinth backfilling.',
    price: 2800,
    unit: 'Load',
    image_url: '/images/gravel.jpg',
    available: 1,
    display_order: 9
  },
  {
    id: 10,
    name: 'Crusher Powder (Dust)',
    category: 'Powder',
    description: 'Fine crushed blue metal stone dust used for paving stone bedding, solid brick manufacturing, and tile setting.',
    price: 2400,
    unit: 'Load',
    image_url: '/images/crusher_powder.jpg',
    available: 1,
    display_order: 10
  }
];

export const DEFAULT_SERVICES = [
  {
    id: 1,
    name: 'Construction Material Supply',
    description: 'Wholesale and retail supply of top-grade crushed granite aggregates and masonry materials across Puducherry.',
    icon_name: 'Layers',
    starting_price: 2500,
    available: 1
  },
  {
    id: 2,
    name: 'Sand Supply (M-Sand, P-Sand, River Sand)',
    description: 'Certified manufactured and natural sands for smooth wall plastering, column casting, and structural concrete.',
    icon_name: 'Feather',
    starting_price: 4800,
    available: 1
  },
  {
    id: 3,
    name: 'Blue Metal Aggregates Supply',
    description: 'Machine-crushed, dust-free blue metal stones from 6mm (1/4") to 40mm (1 1/2") with certified strength testing.',
    icon_name: 'Gem',
    starting_price: 3600,
    available: 1
  },
  {
    id: 4,
    name: 'Gravel & Site Filling',
    description: 'Subgrade gravel and high-density kraval filling for foundation trenches, road formation, and warehouse leveling.',
    icon_name: 'Mountain',
    starting_price: 2800,
    available: 1
  },
  {
    id: 5,
    name: 'Crusher Powder Supply',
    description: 'Bulk delivery of stone quarry dust for block manufacturing units, flooring pre-mix, and paver interlocking.',
    icon_name: 'Wind',
    starting_price: 2400,
    available: 1
  },
  {
    id: 6,
    name: 'Material Transportation Service',
    description: 'Dedicated fleet of modern hydraulic tractors, mini tipper trucks, and heavy haulage lorries on call.',
    icon_name: 'Truck',
    starting_price: 1500,
    available: 1
  }
];

export const DEFAULT_REVIEWS = [
  {
    id: 1,
    customer_name: 'V. Ramanathan (Civil Contractor)',
    rating: 5,
    comment: 'Consistent quality 20mm blue metals and M-sand for our residential projects in Lawspet. Accurate weighbridge slips and prompt tractor delivery.',
    created_at: '2026-03-12'
  },
  {
    id: 2,
    customer_name: 'S. Jayakumar (Home Builder)',
    rating: 5,
    comment: 'P-Sand quality is exceptional for plastering. No cracks or shrinkage. Their drivers easily navigated the narrow streets of Thilaspettai.',
    created_at: '2026-03-24'
  },
  {
    id: 3,
    customer_name: 'Er. Anand (Anand Constructions)',
    rating: 5,
    comment: 'Direct quarry prices without middlemen. Ordered 12 loads of 40mm ballast and crusher powder for our site in Villianur. Highly dependable team.',
    created_at: '2026-04-02'
  }
];
