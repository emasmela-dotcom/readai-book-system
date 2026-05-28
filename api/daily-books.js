// Vercel Serverless Function for Daily Book Addition
// Runs automatically via Vercel Cron at 6:00 AM UTC daily

const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL)

// Even distribution: Exactly 200 books
const EVEN_DISTRIBUTION = {
  fiction: {
    sci_fi: 7, fantasy: 7, mystery: 6, romance: 6,
    literary: 6, thriller: 6, horror: 6, historical_fiction: 6
  },
  non_fiction: {
    self_help: 5, business: 5, history: 5, science: 5,
    biography: 5, memoir: 5, philosophy: 5, psychology: 5,
    health: 5, travel: 5, cooking: 5, art: 5,
    technology: 5, education: 5, sports: 5, nature: 5
  },
  children: {
    picture_books: 7, young_adult: 7, middle_grade: 7,
    children_fiction: 7, educational: 7
  },
  educational: {
    programming: 7, language_learning: 7, academic: 7,
    reference: 7, textbooks: 7
  }
}

const BOOK_TEMPLATES = {
  sci_fi: {
    titles: ["Quantum Paradox", "Neural Networks", "Stellar Colonies", "Digital Consciousness", "Time Fractures", "Galactic Empires", "AI Revolution", "Space Odyssey"],
    authors: ["Alex Chen", "Sarah Martinez", "David Kim", "Emma Thompson", "Michael Rodriguez"],
    tags: ["space", "technology", "future", "AI"]
  },
  fantasy: {
    titles: ["Dragon's Legacy", "Magic Academy", "Elven Kingdoms", "Shadow Realms", "Crystal Prophecy", "Mystic Warriors"],
    authors: ["Morgan Black", "Luna Silver", "Phoenix Gold", "Storm Rider", "Crystal Moon"],
    tags: ["magic", "dragons", "elves", "wizards"]
  },
  mystery: {
    titles: ["Midnight Murders", "Hidden Clues", "Silent Witness", "Dark Secrets", "Crime Scene"],
    authors: ["Detective Stone", "Mystery Writer", "Crime Solver", "Private Eye"],
    tags: ["murder", "detective", "mystery", "crime"]
  },
  romance: {
    titles: ["Love's Journey", "Heart's Desire", "Passionate Embrace", "Sweet Romance", "Forbidden Love"],
    authors: ["Romance Writer", "Love Storyteller", "Heart Mender", "Passion Weaver"],
    tags: ["love", "romance", "passion", "heart"]
  },
  self_help: {
    titles: ["Mindful Living", "Success Habits", "Positive Thinking", "Life Transformation", "Goal Setting"],
    authors: ["Life Coach", "Success Mentor", "Wellness Expert", "Motivation Speaker"],
    tags: ["self-improvement", "motivation", "success", "happiness"]
  },
  business: {
    titles: ["Startup Success", "Business Strategy", "Leadership Excellence", "Marketing Mastery", "Financial Freedom"],
    authors: ["Business Expert", "Entrepreneur", "Management Guru", "Marketing Pro"],
    tags: ["business", "entrepreneurship", "leadership", "marketing"]
  }
}

function generateBook(category, subcategory) {
  const templates = BOOK_TEMPLATES[subcategory] || {
    titles: [`${subcategory} Book ${Math.floor(Math.random() * 1000)}`],
    authors: [`Author ${Math.floor(Math.random() * 100)}`],
    tags: ["general", "book"]
  }
  
  const title = templates.titles[Math.floor(Math.random() * templates.titles.length)]
  const author = templates.authors[Math.floor(Math.random() * templates.authors.length)]
  const year = Math.floor(Math.random() * (2024 - 1950 + 1)) + 1950
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1)
  const pages = Math.floor(Math.random() * 650) + 150
  const tags = templates.tags.slice(0, Math.min(4, templates.tags.length))
  
  return {
    title,
    author,
    year,
    rating: parseFloat(rating),
    description: `An engaging ${subcategory} book that will captivate readers.`,
    tags,
    pages,
    difficulty: ["beginner", "intermediate", "advanced"][Math.floor(Math.random() * 3)],
    recommended_for: ["adults", "young adults", "children", "all ages"][Math.floor(Math.random() * 4)],
    category,
    subcategory,
    added_date: new Date().toISOString().split('T')[0]
  }
}

module.exports = async (req, res) => {
  // Security check
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const today = new Date().toISOString().split('T')[0]
  const log = []
  log.push(`\n🕕 ${new Date().toISOString()} - Starting daily book addition...`)
  log.push(`📅 Date: ${today}`)

  try {
    // Check if already added today
    const existingLogs = await sql`SELECT * FROM daily_logs WHERE date = ${today} LIMIT 1`
    
    if (existingLogs.length > 0) {
      log.push(`✅ Books already added for ${today}`)
      return res.json({ 
        success: true, 
        message: 'Books already added today',
        log: log.join('\n'),
        previous: existingLogs[0]
      })
    }

    log.push(`📚 Generating 200 books evenly distributed...`)

    // Generate books
    const booksToAdd = []
    let totalCount = 0

    for (const [mainCategory, subcategories] of Object.entries(EVEN_DISTRIBUTION)) {
      for (const [subcategory, count] of Object.entries(subcategories)) {
        for (let i = 0; i < count; i++) {
          booksToAdd.push(generateBook(mainCategory, subcategory))
          totalCount++
        }
        log.push(`  ✅ Generated ${count} books for ${mainCategory}/${subcategory}`)
      }
    }

    log.push(`\n📦 Total: ${totalCount} books`)
    log.push(`💾 Inserting into Neon database...`)

    // Insert books
    let booksInserted = 0
    for (const book of booksToAdd) {
      await sql`
        INSERT INTO books (title, author, year, rating, description, tags, pages, difficulty, recommended_for, category, subcategory, added_date)
        VALUES (${book.title}, ${book.author}, ${book.year}, ${book.rating}, ${book.description}, ${book.tags}, ${book.pages}, ${book.difficulty}, ${book.recommended_for}, ${book.category}, ${book.subcategory}, ${book.added_date})
      `
      booksInserted++
    }

    // Get total count
    const totalBooksResult = await sql`SELECT COUNT(*) as count FROM books`
    const totalBooks = parseInt(totalBooksResult[0]?.count || 0)

    // Log to daily_logs
    await sql`
      INSERT INTO daily_logs (date, books_added, total_books, execution_time, status)
      VALUES (${today}, ${booksInserted}, ${totalBooks}, ${new Date().toISOString()}, 'success')
    `

    log.push(`\n🎉 Successfully added ${booksInserted} books!`)
    log.push(`📊 Total books in database: ${totalBooks}`)
    log.push(`✅ Logged to daily_logs table`)

    return res.json({
      success: true,
      date: today,
      booksAdded: booksInserted,
      totalBooks,
      executionTime: new Date().toISOString(),
      log: log.join('\n'),
      proof: {
        sampleBooks: booksToAdd.slice(0, 5).map(b => ({ 
          title: b.title, 
          author: b.author, 
          category: b.category, 
          subcategory: b.subcategory 
        })),
        categoryBreakdown: Object.entries(EVEN_DISTRIBUTION).map(([cat, subs]) => ({
          category: cat,
          total: Object.values(subs).reduce((a, b) => a + b, 0),
          subcategories: Object.entries(subs).map(([sub, count]) => ({ subcategory: sub, count }))
        }))
      }
    })

  } catch (error) {
    const errorLog = [...log, `\n❌ Error: ${error.message}`]
    
    try {
      await sql`
        INSERT INTO daily_logs (date, books_added, total_books, execution_time, status, error_message)
        VALUES (${today}, 0, 0, ${new Date().toISOString()}, 'error', ${error.message})
      `
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      log: errorLog.join('\n')
    })
  }
}

