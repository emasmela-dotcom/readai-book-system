import type { Locale } from '@/lib/i18n/config'

const en = {
  brand: 'ReadAI365',
  nav: {
    browse: 'Browse',
    genres: 'Genres',
    sources: 'Sources',
    saved: 'Saved',
    movies: 'Movies',
    magazine: 'Magazine',
    cookbooks: 'Cookbooks',
    allSources: 'All sources',
    startTrial: 'Start free trial',
    signIn: 'Sign in',
    signOut: 'Sign out',
  },
  home: {
    searchLabel: 'Book club search',
    searchPlaceholder: 'Title, author, or ask: discussion questions for Pride and Prejudice',
    searchButton: 'Search',
    searching: 'Searching',
    searchError: 'Search is unavailable right now. Please try again later.',
    cookbooksHeading: 'Cookbooks & recipes',
    cookbooksBody: 'Browse cookery titles via connected sources in the cooking room.',
    openCooking: 'Open cooking room →',
    moviesHeading: 'Movies',
    openMovies: 'Open Movies section →',
    heroEyebrow: 'Private reading club',
    heroTitle: 'Every book. Every reader. Every story.',
    heroBody: 'Join a community of readers who live for their next great read.',
    heroTrial: '14-day free trial · then $9/month or $79/year.',
    allRooms: 'All rooms →',
    filmRoom: 'Film room',
    movieBooks: 'movie books',
    enterMovies: 'Enter Movies section →',
    continueReading: 'Continue reading',
    returnPlace: 'Return to your place',
    returnPlaceBody: 'When you open a book from a connected source, your last session can appear here.',
    resumeReading: 'Resume reading',
    waitingSession: 'Waiting for your first session',
    savedBooks: 'Saved books',
    buildShelf: 'Build a personal shelf',
    saveWhileBrowsing: 'Save titles while browsing connected sources.',
    openSavedShelf: 'View saved shelf →',
    browseByRoom: 'Browse by room',
    walkRooms: 'Walk the rooms',
    walkRoomsBody: 'Move between horror, mystery, romance, fantasy, literary fiction, and every room beyond.',
    enterRooms: 'Enter the rooms',
    movieBooksBody: 'Search a film and follow connected source links for its book.',
    readingRoomsEyebrow: 'Reading rooms',
    readingRoomsTitle: 'Move between rooms',
    readingRoomsBody:
      'Every room browses connected sources — Open Library, Gutenberg, and more. Pick a genre below, or open the full room list.',
    titlesViaSources: '{titles} titles via sources across {rooms} rooms',
    viewAllRooms: 'View all rooms →',
    loadingGenres: 'Loading genres…',
    filmRoomEyebrow: 'Film room',
    moviesSectionTitle: 'Movies & movie books',
    moviesSectionBody:
      'Browse {count} film-to-book pairings — search a title and follow connected source links for its book.',
    kitchenEyebrow: 'Kitchen reading',
    connectedSourcesTitle: 'Connected sources',
    connectedSourcesBody:
      'Legal book sites linked from ReadAI — Gutenberg, Open Library, Internet Archive, Libby, WorldCat, and more.',
    magazinesTitle: 'Magazine picks for variety',
    magazinesBody:
      "Today's magazines and journals — open their sites for essays, fiction, news, and culture.",
    magazinesNote: 'External sites may require their own subscription.',
    popularRooms: 'Popular rooms',
    allRoomsLink: 'All rooms',
    loadingRooms: 'Loading the reading rooms…',
    roomsEmpty: 'Rooms load from connected sources — try again in a moment.',
    movieBookLabel: 'Movie book',
    savedCountTitle: '{count} saved on your account',
    savedCountBody: 'Open your shelf to see every title saved to your account.',
  },
  auth: {
    clubHome: 'Club home',
    signInEyebrow: 'Member sign in',
    signInTitle: 'Welcome back',
    signInBody: 'Sign in to open books, saved shelves, and reading rooms.',
    signUpEyebrow: 'Free trial',
    signUpTitle: 'Start reading',
    signUpBody: 'Create an account for a 14-day free trial of ReadAI365.',
    loading: 'Loading…',
  },
  sources: {
    title: 'Legal reading sources',
    description:
      'Master reference for every legal reading, library, film, cookbook, and magazine source connected to ReadAI365.',
    heading: 'Legal reading & discovery',
  },
  support: {
    title: 'Support',
    description: 'Contact ReadAI365 support.',
  },
  subscribe: {
    title: 'Subscribe',
    description: 'Subscribe to continue reading on ReadAI365.',
  },
  footer: {
    copyright: '© 2026 ReadAI365',
    support: 'Contact support',
    language: 'Language',
    english: 'English',
    spanish: 'Español',
  },
  language: {
    label: 'Language',
    en: 'English',
    es: 'Español',
  },
  meta: {
    title: 'ReadAI365 — Find any book and where you can read it',
    description:
      'Search any book title and find legal places to read it online. Browse genres, cookbooks, and reading rooms. Try ReadAI365 free for 14 days.',
  },
} as const

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]>
}

export type Dictionary = DeepStringRecord<typeof en>

const es: Dictionary = {
  brand: 'ReadAI365',
  nav: {
    browse: 'Explorar',
    genres: 'Géneros',
    sources: 'Fuentes',
    saved: 'Guardados',
    movies: 'Películas',
    magazine: 'Revistas',
    cookbooks: 'Cocina',
    allSources: 'Todas las fuentes',
    startTrial: 'Prueba gratis',
    signIn: 'Entrar',
    signOut: 'Salir',
  },
  home: {
    searchLabel: 'Búsqueda del club',
    searchPlaceholder: 'Título, autor, o pregunta: temas de debate para Orgullo y prejuicio',
    searchButton: 'Buscar',
    searching: 'Buscando',
    searchError: 'La búsqueda no está disponible ahora. Inténtalo de nuevo más tarde.',
    cookbooksHeading: 'Libros de cocina y recetas',
    cookbooksBody: 'Explora títulos de cocina en la sala de cocina con fuentes conectadas.',
    openCooking: 'Abrir sala de cocina →',
    moviesHeading: 'Películas',
    openMovies: 'Abrir sección de películas →',
    heroEyebrow: 'Club de lectura privado',
    heroTitle: 'Cada libro. Cada lector. Cada historia.',
    heroBody: 'Únete a una comunidad de lectores que viven por su próxima gran lectura.',
    heroTrial: 'Prueba gratis 14 días · luego $9/mes o $79/año.',
    allRooms: 'Todas las salas →',
    filmRoom: 'Sala de cine',
    movieBooks: 'libros de películas',
    enterMovies: 'Entrar a Películas →',
    continueReading: 'Seguir leyendo',
    returnPlace: 'Vuelve a tu lugar',
    returnPlaceBody: 'Cuando abras un libro desde una fuente conectada, tu última sesión puede aparecer aquí.',
    resumeReading: 'Reanudar lectura',
    waitingSession: 'Esperando tu primera sesión',
    savedBooks: 'Libros guardados',
    buildShelf: 'Crea tu estante personal',
    saveWhileBrowsing: 'Guarda títulos mientras exploras las fuentes conectadas.',
    openSavedShelf: 'Ver estante guardado →',
    browseByRoom: 'Explorar por sala',
    walkRooms: 'Recorre las salas',
    walkRoomsBody: 'Muévete entre terror, misterio, romance, fantasía, ficción literaria y más.',
    enterRooms: 'Entrar a las salas',
    movieBooksBody: 'Busca una película y sigue los enlaces de fuentes para su libro.',
    readingRoomsEyebrow: 'Salas de lectura',
    readingRoomsTitle: 'Muévete entre salas',
    readingRoomsBody:
      'Cada sala explora fuentes conectadas — Open Library, Gutenberg y más. Elige un género abajo, o abre la lista completa de salas.',
    titlesViaSources: '{titles} títulos vía fuentes en {rooms} salas',
    viewAllRooms: 'Ver todas las salas →',
    loadingGenres: 'Cargando géneros…',
    filmRoomEyebrow: 'Sala de cine',
    moviesSectionTitle: 'Películas y libros de cine',
    moviesSectionBody:
      'Explora {count} parejas película–libro — busca un título y sigue los enlaces de fuentes para su libro.',
    kitchenEyebrow: 'Lectura de cocina',
    connectedSourcesTitle: 'Fuentes conectadas',
    connectedSourcesBody:
      'Sitios legales de libros enlazados desde ReadAI — Gutenberg, Open Library, Internet Archive, Libby, WorldCat y más.',
    magazinesTitle: 'Revistas para variar',
    magazinesBody:
      'Revistas y diarios de hoy — abre sus sitios para ensayos, ficción, noticias y cultura.',
    magazinesNote: 'Los sitios externos pueden pedir su propia suscripción.',
    popularRooms: 'Salas populares',
    allRoomsLink: 'Todas las salas',
    loadingRooms: 'Cargando las salas de lectura…',
    roomsEmpty: 'Las salas se cargan desde fuentes conectadas — inténtalo en un momento.',
    movieBookLabel: 'Libro de película',
    savedCountTitle: '{count} guardados en tu cuenta',
    savedCountBody: 'Abre tu estante para ver cada título guardado.',
  },
  auth: {
    clubHome: 'Inicio del club',
    signInEyebrow: 'Acceso de miembros',
    signInTitle: 'Bienvenido de nuevo',
    signInBody: 'Entra para abrir libros, estantes guardados y salas de lectura.',
    signUpEyebrow: 'Prueba gratis',
    signUpTitle: 'Empieza a leer',
    signUpBody: 'Crea una cuenta para 14 días de prueba gratis en ReadAI365.',
    loading: 'Cargando…',
  },
  sources: {
    title: 'Fuentes de lectura legales',
    description:
      'Referencia de todas las fuentes legales de lectura, bibliotecas, cine, cocina y revistas conectadas a ReadAI365.',
    heading: 'Lectura legal y descubrimiento',
  },
  support: {
    title: 'Soporte',
    description: 'Contacta con el soporte de ReadAI365.',
  },
  subscribe: {
    title: 'Suscribirse',
    description: 'Suscríbete para seguir leyendo en ReadAI365.',
  },
  footer: {
    copyright: '© 2026 ReadAI365',
    support: 'Contactar soporte',
    language: 'Idioma',
    english: 'English',
    spanish: 'Español',
  },
  language: {
    label: 'Idioma',
    en: 'English',
    es: 'Español',
  },
  meta: {
    title: 'ReadAI365 — Encuentra cualquier libro y dónde leerlo',
    description:
      'Busca cualquier título y encuentra dónde leerlo online de forma legal. Explora géneros, cocina y salas de lectura. Prueba ReadAI365 gratis 14 días.',
  },
}

export const dictionaries: Record<Locale, Dictionary> = { en, es }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en
}
