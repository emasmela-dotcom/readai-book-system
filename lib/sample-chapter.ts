import type { ReadingSource } from '@/lib/reading-content'

/** Opening chapter when no full text is in the library (club catalog entries). */
export function sampleChapterText(book: ReadingSource & { id: number }): string {
  const title = book.title.trim()
  const author = book.author.trim()
  const sub = book.subcategory ?? 'fiction'

  if (sub === 'mystery' || sub === 'thriller' || sub === 'horror') {
    return mysteryOpening(title, author, book.id)
  }

  return genericOpening(title, author, book.id)
}

function mysteryOpening(title: string, author: string, seed: number): string {
  const hour = ['eleven', 'one', 'two'][seed % 3]
  const weather = ['rain', 'fog', 'wind'][Math.floor(seed / 3) % 3]

  return [
    `Chapter 1`,
    ``,
    `The phone rang at ${hour} o'clock. In this city, calls that late rarely brought good news. Detective Stone set down the file on ${title} and listened to the ${weather} scratch against the window.`,
    ``,
    `"You need to see the scene," the voice said. No greeting. No name. Only urgency.`,
    ``,
    `By the time Stone reached the address, the street had been cordoned off. Yellow tape fluttered under the lamps. A crowd pressed at the edges, hungry for a story they could carry home. Stone moved through them with the practiced indifference of someone who had learned that curiosity and compassion were not the same thing.`,
    ``,
    `Inside, the air smelled of iron and old carpet. A single bulb swung from the ceiling. On the table lay a notebook, open to a page of careful handwriting. The last line read: Trust no one who knew the midnight hour.`,
    ``,
    `Stone photographed the room in silence. Footprints in the dust. A chair knocked sideways. A cup of tea, still warm. Whoever had been here had left in a hurry—or had been taken.`,
    ``,
    `"This connects to the other cases," said the officer at the door. "Same phrase. Same hour. Different victims."`,
    ``,
    `Stone thought of the reports stacked on the desk downtown, each one a door into another grief. The press would call it a pattern by morning. The mayor would call it a crisis by noon. Stone called it work.`,
    ``,
    `Back at the precinct, Stone spread the files under the lamp. ${title}. Three witnesses. Two alibis that contradicted each other. One name that appeared in every margin: a writer the city barely remembered, ${author}.`,
    ``,
    `Stone dialed the number from the notebook. It rang twice. A calm voice answered, as if sleep were a luxury reserved for the innocent.`,
    ``,
    `"You found my pages," the voice said.`,
    ``,
    `"I found your warning," Stone replied. "Who is next?"`,
    ``,
    `A pause. Somewhere in the background, a clock struck the hour.`,
    ``,
    `"That depends," said the voice, "on whether you believe the killer is hunting victims—or hunting you."`,
    ``,
    `Stone hung up and wrote the time in the log. Outside, the ${weather} continued. Inside, the case that would become ${title} had only just begun.`,
    ``,
    `Stone opened the first witness statement and read until dawn. Every answer was polite. Every alibi was neat. Neatness, Stone had learned, was sometimes the surest sign of a lie.`,
    ``,
    `When the sun rose, the city pretended nothing had changed. Stone knew better. The book of evidence was thickening. The list of names was lengthening. And somewhere between the lines, the truth waited—patient as a blade in a drawer.`,
  ].join('\n')
}

function genericOpening(title: string, author: string, seed: number): string {
  const lines = [
    `Chapter 1`,
    ``,
    `The story that would be known as ${title} began on an ordinary afternoon—except that nothing stays ordinary for long once you start paying attention.`,
    ``,
    `${author} understood that better than most. The first pages of a life, like the first pages of a book, rarely announce what they will cost you.`,
    ``,
    `Our narrator paused at the threshold of the old house. Light fell through the windows in long rectangles. Dust turned in the air like slow constellations.`,
    ``,
    `There was a letter on the table. Unopened. The seal had been broken once before and pressed shut again, as if someone had changed their mind about mercy.`,
    ``,
    `To read it was to accept an invitation no sensible person would accept. To refuse it was to spend the rest of your life wondering what you had declined.`,
    ``,
    `The choice was made the way most important choices are made—not with courage, but with curiosity.`,
    ``,
    `By evening, the streets had emptied. By midnight, the truth had begun to gather its weight. By morning, ${title} was no longer a title on a shelf. It was a door, and the door was open.`,
    ``,
    `What follows is the record of what walked through.`,
  ]

  if (seed % 2 === 0) {
    lines.push(
      ``,
      `The first voice you hear may not be the one you trust. The first clue may not be the one that matters. Keep reading.`,
    )
  }

  return lines.join('\n')
}
