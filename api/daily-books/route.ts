import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Even distribution: Exactly 200 books across all categories
// Fiction: 50 books (6-7 per subcategory)
// Non-Fiction: 80 books (5 per subcategory)
// Children: 35 books (7 per subcategory)
// Educational: 35 books (7 per subcategory)
// Total: 200 books
const EVEN_DISTRIBUTION = {
  fiction: {
    sci_fi: 7,        // 7 books
    fantasy: 7,       // 7 books
    mystery: 6,       // 6 books
    romance: 6,       // 6 books
    literary: 6,      // 6 books
    thriller: 6,      // 6 books
    horror: 6,        // 6 books
    historical_fiction: 6  // 6 books
    // Total: 50 books
  },
  non_fiction: {
    self_help: 5,
    business: 5,
    history: 5,
    science: 5,
    biography: 5,
    memoir: 5,
    philosophy: 5,
    psychology: 5,
    health: 5,
    travel: 5,
    cooking: 5,
    art: 5,
    technology: 5,
    education: 5,
    sports: 5,
    nature: 5
    // Total: 80 books
  },
  children: {
    picture_books: 7,
    young_adult: 7,
    middle_grade: 7,
    children_fiction: 7,
    educational: 7
    // Total: 35 books
  },
  educational: {
    programming: 7,
    language_learning: 7,
    academic: 7,
    reference: 7,
    textbooks: 7
    // Total: 35 books
  }
}
// Grand Total: 50 + 80 + 35 + 35 = 200 books ✓

// Book templates for generation
const BOOK_TEMPLATES: Record<string, any> = {
  sci_fi: {
    titles: [
      "Quantum Paradox", "Neural Networks", "Stellar Colonies", "Digital Consciousness",
      "Time Fractures", "Galactic Empires", "AI Revolution", "Space Odyssey",
      "Cyberpunk Chronicles", "Dimensional Rifts", "Mars Chronicles", "Robot Uprising",
      "Virtual Realities", "Alien Contact", "Future Wars", "Genetic Evolution"
    ],
    authors: [
      "Alex Chen", "Sarah Martinez", "David Kim", "Emma Thompson", "Michael Rodriguez",
      "Lisa Wang", "James Anderson", "Rachel Green", "Tom Wilson", "Anna Lee"
    ],
    tags: ["space", "technology", "future", "AI", "robots", "time travel", "alien", "cyberpunk"]
  },
  fantasy: {
    titles: [
      "Dragon's Legacy", "Magic Academy", "Elven Kingdoms", "Shadow Realms",
      "Crystal Prophecy", "Mystic Warriors", "Enchanted Forests", "Ancient Spells",
      "Phoenix Rising", "Wizard's Quest", "Fairy Tales", "Mythical Creatures",
      "Dark Magic", "Light Bringers", "Elemental Powers", "Sacred Artifacts"
    ],
    authors: [
      "Morgan Black", "Luna Silver", "Phoenix Gold", "Storm Rider", "Crystal Moon",
      "Shadow Walker", "Light Bringer", "Dragon Heart", "Mystic Sage", "Enchanted Soul"
    ],
    tags: ["magic", "dragons", "elves", "wizards", "quest", "prophecy", "mythical", "enchanted"]
  },
  mystery: {
    titles: [
      "Midnight Murders", "Hidden Clues", "Silent Witness", "Dark Secrets",
      "Crime Scene", "Detective's Journal", "Cold Case Files", "Mystery Manor",
      "Shadow Suspects", "Blood Evidence", "Private Eye", "Murder Mystery",
      "Criminal Minds", "Deadly Deception", "Fatal Attraction", "Sinister Plot"
    ],
    authors: [
      "Detective Stone", "Mystery Writer", "Crime Solver", "Private Eye", "Investigator",
      "Sleuth Master", "Case Solver", "Mystery Hunter", "Crime Analyst", "Truth Seeker"
    ],
    tags: ["murder", "detective", "mystery", "crime", "investigation", "clues", "suspense", "thriller"]
  },
  romance: {
    titles: [
      "Love's Journey", "Heart's Desire", "Passionate Embrace", "Sweet Romance",
      "Forbidden Love", "Second Chances", "Love Letters", "Wedding Bells",
      "Romantic Getaway", "Love Story", "Heartbreak Hotel", "True Love",
      "Love Triangle", "Romantic Comedy", "Love at First Sight", "Eternal Love"
    ],
    authors: [
      "Romance Writer", "Love Storyteller", "Heart Mender", "Passion Weaver", "Love Creator",
      "Romantic Soul", "Heart Healer", "Love Dreamer", "Passion Writer", "Romance Queen"
    ],
    tags: ["love", "romance", "passion", "heart", "relationship", "wedding", "dating", "emotion"]
  },
  self_help: {
    titles: [
      "Mindful Living", "Success Habits", "Positive Thinking", "Life Transformation",
      "Goal Setting", "Stress Management", "Confidence Building", "Time Mastery",
      "Emotional Intelligence", "Leadership Skills", "Communication Mastery", "Life Balance",
      "Personal Growth", "Motivation Secrets", "Happiness Formula", "Life Purpose"
    ],
    authors: [
      "Life Coach", "Success Mentor", "Wellness Expert", "Motivation Speaker", "Growth Guide",
      "Transformation Coach", "Mindfulness Teacher", "Life Strategist", "Personal Development", "Wellness Guru"
    ],
    tags: ["self-improvement", "motivation", "success", "happiness", "growth", "mindfulness", "goals", "life"]
  },
  business: {
    titles: [
      "Startup Success", "Business Strategy", "Leadership Excellence", "Marketing Mastery",
      "Financial Freedom", "Entrepreneur's Guide", "Team Building", "Innovation Drive",
      "Sales Psychology", "Digital Marketing", "Business Growth", "Investment Wisdom",
      "Management Skills", "Customer Service", "Business Planning", "Market Analysis"
    ],
    authors: [
      "Business Expert", "Entrepreneur", "Management Guru", "Marketing Pro", "Leadership Coach",
      "Business Strategist", "Success Coach", "Innovation Leader", "Sales Expert", "Business Mentor"
    ],
    tags: ["business", "entrepreneurship", "leadership", "marketing", "strategy", "success", "management", "innovation"]
  }
}

function generateBook(category: string, subcategory: string) {
  const templates = BOOK_TEMPLATES[subcategory] || {
    titles: [`${subcategory} Book ${Math.floor(Math.random() * 1000)}`],
    authors: [`Author ${Math.floor(Math.random() * 100)}`],
    tags: ["general", "book", "reading"]
  }
  
  const title = templates.titles[Math.floor(Math.random() * templates.titles.length)]
  const author = templates.authors[Math.floor(Math.random() * templates.authors.length)]
  const year = Math.floor(Math.random() * (2024 - 1950 + 1)) + 1950
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1)
  const pages = Math.floor(Math.random() * 650) + 150
  
  const descriptions: Record<string, string[]> = {
    sci_fi: ["A thrilling science fiction adventure exploring space, technology, the future, AI, or time travel."],
    fantasy: ["An epic fantasy tale of magic, dragons, heroes, quests, or mystical realms."],
    mystery: ["A gripping mystery involving murder, secrets, detectives, crime, or investigation."],
    romance: ["A heartwarming romance story about love, relationships, passion, second chances, or true love."],
    self_help: ["A practical guide to personal growth, success, happiness, motivation, or life improvement."],
    business: ["Essential insights into business strategy, leadership, entrepreneurship, marketing, or success."]
  }
  
  const description = descriptions[subcategory]?.[0] || `An engaging ${subcategory} book that will captivate readers.`
  const tags = templates.tags.slice(0, Math.min(4, templates.tags.length))
  
  return {
    title,
    author,
    year,
    rating: parseFloat(rating),
    description,
    tags: tags, // Array will be converted to PostgreSQL array by Neon
    pages,
    difficulty: ["beginner", "intermediate", "advanced"][Math.floor(Math.random() * 3)],
    recommended_for: ["adults", "young adults", "children", "all ages"][Math.floor(Math.random() * 4)],
    category,
    subcategory,
    added_date: new Date().toISOString().split('T')[0]
  }
}

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (optional security)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]
  const log: string[] = []
  log.push(`\n🕕 ${new Date().toISOString()} - Starting daily book addition...`)
  log.push(`📅 Date: ${today}`)

  try {
    // Check if books were already added today
    const existingLogs = await sql`
      SELECT * FROM daily_logs 
      WHERE date = ${today}
      LIMIT 1
    `

    if (existingLogs.length > 0) {
      log.push(`✅ Books already added for ${today}`)
      log.push(`📊 Previous addition: ${existingLogs[0].books_added} books`)
      return NextResponse.json({ 
        success: true, 
        message: 'Books already added today',
        log: log.join('\n'),
        previous: existingLogs[0]
      })
    }

    log.push(`📚 Generating 200 books evenly distributed across all categories...`)

    // Generate books according to even distribution
    const booksToAdd: any[] = []
    let totalCount = 0

    for (const [mainCategory, subcategories] of Object.entries(EVEN_DISTRIBUTION)) {
      for (const [subcategory, count] of Object.entries(subcategories)) {
        for (let i = 0; i < count; i++) {
          const book = generateBook(mainCategory, subcategory)
          booksToAdd.push(book)
          totalCount++
        }
        log.push(`  ✅ Generated ${count} books for ${mainCategory}/${subcategory}`)
      }
    }

    log.push(`\n📦 Total books generated: ${totalCount}`)
    log.push(`💾 Inserting books into Neon database...`)

    // Insert books in batches
    const batchSize = 50
    let booksInserted = 0
    let batchNumber = 0

    for (let i = 0; i < booksToAdd.length; i += batchSize) {
      batchNumber++
      const batch = booksToAdd.slice(i, i + batchSize)
      
      // Insert each book individually for safety (Neon handles this efficiently)
      for (const book of batch) {
        await sql`
          INSERT INTO books (title, author, year, rating, description, tags, pages, difficulty, recommended_for, category, subcategory, added_date)
          VALUES (${book.title}, ${book.author}, ${book.year}, ${book.rating}, ${book.description}, ${book.tags}, ${book.pages}, ${book.difficulty}, ${book.recommended_for}, ${book.category}, ${book.subcategory}, ${book.added_date})
        `
        booksInserted++
      }

      log.push(`  📦 Batch ${batchNumber}: Inserted ${batch.length} books (${booksInserted}/${totalCount})`)
    }

    // Get total book count
    const totalBooksResult = await sql`SELECT COUNT(*) as count FROM books`
    const totalBooks = totalBooksResult[0]?.count || 0

    // Log today's additions
    await sql`
      INSERT INTO daily_logs (date, books_added, total_books, execution_time, status)
      VALUES (${today}, ${booksInserted}, ${totalBooks}, ${new Date().toISOString()}, 'success')
    `

    log.push(`\n🎉 Successfully added ${booksInserted} books to Neon!`)
    log.push(`📊 Total books in database: ${totalBooks}`)
    log.push(`✅ Logged to daily_logs table`)
    log.push(`🛡️ This activity will prevent Neon from pausing!`)

    // Return comprehensive proof
    return NextResponse.json({
      success: true,
      date: today,
      booksAdded: booksInserted,
      totalBooks,
      distribution: EVEN_DISTRIBUTION,
      executionTime: new Date().toISOString(),
      log: log.join('\n'),
      proof: {
        dailyLogId: (await sql`SELECT id FROM daily_logs WHERE date = ${today} LIMIT 1`)[0]?.id,
        sampleBooks: booksToAdd.slice(0, 5).map(b => ({ title: b.title, author: b.author, category: b.category, subcategory: b.subcategory })),
        categoryBreakdown: Object.entries(EVEN_DISTRIBUTION).map(([cat, subs]) => ({
          category: cat,
          total: Object.values(subs).reduce((a, b) => a + b, 0),
          subcategories: Object.entries(subs).map(([sub, count]) => ({ subcategory: sub, count }))
        }))
      }
    })

  } catch (error: any) {
    const errorLog = [...log, `\n❌ Error: ${error.message}`, `Stack: ${error.stack}`]
    
    // Log error to database
    try {
      await sql`
        INSERT INTO daily_logs (date, books_added, total_books, execution_time, status, error_message)
        VALUES (${today}, 0, 0, ${new Date().toISOString()}, 'error', ${error.message})
      `
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

    return NextResponse.json({
      success: false,
      error: error.message,
      log: errorLog.join('\n')
    }, { status: 500 })
  }
}

