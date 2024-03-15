import { faker } from '@faker-js/faker'
import { neon } from '@neondatabase/serverless'
import { Index } from '@upstash/vector'
import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { vectorize } from '../lib/vectorize'
import { productsTable } from './schema'

dotenv.config()

const index = new Index()

async function main() {
  const connector = neon(process.env.DATABASE_URL!)
  // @ts-expect-error neon-drizzle
  const db = drizzle(connector)

  const products: (typeof productsTable.$inferInsert)[] = []

  const productImageIDs = [
    {
      imageId: 'dark_down_jacket_1.png',
      description:
        'A sleek, insulated down jacket designed for chilly urban adventures. Its slim fit and dark hue make it a versatile addition to any winter wardrobe.',
    },
    {
      imageId: 'dark_down_jacket_2.png',
      description:
        'This durable down jacket offers exceptional warmth with a touch of elegance. Perfect for those who demand both style and functionality in cold weather.',
    },
    {
      imageId: 'dark_fleece_jacket_1.png',
      description:
        'Experience the cozy warmth of this dark fleece jacket. Ideal for layering, its soft texture and classic design ensure comfort and style on cooler days.',
    },
    {
      imageId: 'dark_leather_jacket_1.png',
      description:
        'A timeless dark leather jacket that combines classic styling with rugged durability. Perfect for adding an edge to any outfit, rain or shine.',
    },
    {
      imageId: 'dark_parka_jacket_1.png',
      description:
        'Stay protected against the elements with this durable parka. Its insulated lining and fur-trimmed hood offer warmth and style in harsh conditions.',
    },
    {
      imageId: 'dark_parka_jacket_2.png',
      description:
        'This sleek parka features a waterproof exterior and a thermal interior, making it a must-have for winter escapades in the city or the mountains.',
    },
    {
      imageId: 'dark_parka_jacket_3.png',
      description:
        'With its adjustable features and multiple pockets, this parka blends practicality with modern aesthetics for the ultimate winter outerwear.',
    },
    {
      imageId: 'dark_trench_coat_1.png',
      description:
        'A modern twist on a classic design, this dark trench coat offers both sophistication and weather resistance, perfect for rainy days.',
    },
    {
      imageId: 'light_down_jacket_1.png',
      description:
        'Lightweight yet warm, this down jacket is an essential layer for transitional weather, offering comfort without bulk.',
    },
    {
      imageId: 'light_down_jacket_2.png',
      description:
        'Embrace the cold in this light and airy down jacket, featuring a water-resistant shell and a sleek design for everyday wear.',
    },
    {
      imageId: 'light_down_jacket_3.png',
      description:
        'This stylish down jacket combines warmth and lightweight design, making it the perfect companion for winter travel.',
    },
    {
      imageId: 'light_fleece_jacket_1.png',
      description:
        'Enjoy the soft touch of this light fleece jacket, designed for brisk mornings and cool evenings, with a versatile zip-up style for easy layering.',
    },
    {
      imageId: 'light_jeans_jacket_1.png',
      description:
        'A casual classic, this light denim jacket adds a layer of cool to any outfit, perfect for those crisp, sunny days.',
    },
    {
      imageId: 'light_jeans_jacket_2.png',
      description:
        'Upgrade your casual wear with this distressed light denim jacket, featuring a relaxed fit and timeless appeal.',
    },
    {
      imageId: 'light_parka_jacket_1.png',
      description:
        "This light parka offers a breathable, water-resistant layer, ideal for unpredictable weather, with a sleek design that doesn't compromise on style.",
    },
    {
      imageId: 'light_trench_coat_1.png',
      description:
        'A chic and lightweight trench coat that brings an elegant layer to spring and autumn outfits, with a belted waist for a flattering fit.',
    },
    {
      imageId: 'light_trench_coat_2.png',
      description:
        'Enjoy a stylish and sophisticated look with this lightweight trench coat made from a fabric that resists both wind and rain. Perfect for the transition between seasons.',
    },
    {
      imageId: 'light_wind_jacket_1.png',
      description:
        'Take on the breezy days with this lightweight wind jacket that is designed to offer protection and style with its minimalist design and functional features.',
    },
    {
      imageId: 'light_wind_jacket_2.png',
      description:
        'A versatile windbreaker for active days. This jacket offers lightweight comfort and resistance to the elements in a sleek package.',
    },
    {
      imageId: 'light_wind_jacket_3.png',
      description:
        'Stay ahead of the weather with this dynamic light wind jacket, combining breathability with waterproof technology for all-day comfort.',
    },
    {
      imageId: 'light_wind_jacket_4.png',
      description:
        'A comfortable wind jacket designed to keep you warm during winter or rain. With a minimal light grey color it suits the rest of your outfit well.',
    },
  ]

  productImageIDs.forEach(({ description, imageId }, i) => {
    products.push({
      id: (i + 1).toString(),
      name: formatFileName(imageId),
      description,
      price: parseFloat(faker.commerce.price({ min: 40, max: 200 })),
      imageId,
    })
  })

  products.forEach(async (product) => {
    await db.insert(productsTable).values(product).onConflictDoNothing()

    await index.upsert({
      id: product.id!,
      vector: await vectorize(`${product.name}: ${product.description}`),
      metadata: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageId: product.imageId,
      },
    })
  })
}


// 'dark_down_jacket_1.png' -> 'Dark Down Jacket 1'
function formatFileName(fileName: string): string {
  const nameWithoutExtension = fileName.replace(/\.\w+$/, '')
  const words = nameWithoutExtension.split('_')

  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  )
  return capitalizedWords.join(' ')
}

main()
