import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NutriFridge AI',
    short_name: 'NutriFridge',
    description: 'Smart AI Recipe & Fridge Inventory Planner',
    start_url: '/',
    display: 'standalone',
    background_color: '#ECF6EE',
    theme_color: '#29993D',
    icons: [
      {
        src: 'https://picsum.photos/seed/nutri-icon/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/nutri-icon/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
