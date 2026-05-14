/**
 * One-time script: reads dishes-for-categorisation.json, adds a "category"
 * field to every dish using keyword-based rules, and writes the file back.
 *
 * Run: npx tsx scripts/categorize-dishes.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const TAXONOMY = [
  'Starter & Appetiser',
  'Salad',
  'Main Course',
  'Biryani & Rice',
  'Noodles & Pasta',
  'Pizza',
  'Burger',
  'Sandwich & Wraps',
  'Momos & Dimsum',
  'Sushi & Asian',
  'Kebab & Grill',
  'Bread',
  'Side',
  'Snack & Street Food',
  'Thali & Meals',
  'Combos & Offers',
  'Dessert',
  'Beverage',
  'Other',
] as const

type Category = (typeof TAXONOMY)[number]

function categorize(name: string): Category {
  const n = name.toLowerCase().trim()

  // ── Beverage ────────────────────────────────────────────────────────────────
  if (
    /\b(juice|lassi|chaas|chaach|chhachh|mor\b|buttermilk|butter milk|chai|tea|coffee|shake|milkshake|smoothie|lemonade|soda|thandai|sharbat|sherbet|aam panna|nimbu pani|jaljeera|mojito|mocktail|cocktail|beer|wine|whisky|whiskey|rum|vodka|brandy|gin|tequila|liqueur|falooda|badam milk|rose milk|cold coffee|hot chocolate|espresso|cappuccino|latte|americano|macchiato|matcha|kombucha|boba|bubble tea|coconut water|kanji|paan shot|squash|punch|fizz|slushie|slush|iced tea|iced coffee|frappe|colada|virgin|lager|stout|cider|mead|sake|toddy|nimbu soda|masala chai|ginger tea|green tea|herbal tea)\b/.test(
      n
    )
  )
    return 'Beverage'
  // standalone "milk" or "water" as a dish name
  if (/^(milk|water|plain water|mineral water)$/.test(n)) return 'Beverage'
  // drink-only patterns
  if (
    /\b(cold drink|soft drink|energy drink|protein shake|fruit shake|mango shake|strawberry shake|chocolate shake|vanilla shake|banana shake)\b/.test(
      n
    )
  )
    return 'Beverage'

  // ── Pizza ────────────────────────────────────────────────────────────────────
  if (/\bpizza\b/.test(n)) return 'Pizza'

  // ── Burger ───────────────────────────────────────────────────────────────────
  if (/\b(burger|whopper)\b/.test(n)) return 'Burger'

  // ── Momos & Dimsum ───────────────────────────────────────────────────────────
  if (/\b(momo|momos|dimsum|dim sum|dumpling|gyoza|har gow|siu mai|xiao long bao|baozi|wonton)\b/.test(n))
    return 'Momos & Dimsum'

  // ── Sushi & Asian ────────────────────────────────────────────────────────────
  if (
    /\b(sushi|sashimi|nigiri|maki|temaki|uramaki|tempura|edamame|teriyaki|yakitori|onigiri|karaage|katsu|tonkatsu|udon|soba|pho|bibimbap|bulgogi|japchae|kimchi fried rice)\b/.test(
      n
    )
  )
    return 'Sushi & Asian'

  // ── Sandwich & Wraps ─────────────────────────────────────────────────────────
  if (
    /\b(sandwich|sub|club|kathi roll|frankie|franky|burrito|quesadilla|taco|tacos|bao bun|banh mi|gyro|shawarma|shavarma)\b/.test(
      n
    )
  )
    return 'Sandwich & Wraps'
  if (/\bwrap\b/.test(n)) return 'Sandwich & Wraps'
  // Rolls that are clearly wraps (not spring rolls or drum rolls)
  if (
    /\broll\b/.test(n) &&
    /\b(kathi|egg|chicken|paneer|veg|seekh|mutton|fish|prawn|aloo|cheese)\b/.test(n) &&
    !/\b(spring|drum|bread|cake|drum|swiss)\b/.test(n)
  )
    return 'Sandwich & Wraps'

  // ── Noodles & Pasta ──────────────────────────────────────────────────────────
  if (
    /\b(noodle|noodles|pasta|spaghetti|penne|fettuccine|linguine|tagliatelle|rigatoni|fusilli|farfalle|chow mein|hakka|lo mein|pad thai|glass noodle|cellophane noodle|maggi|ramen|thukpa|sevai noodle)\b/.test(
      n
    )
  )
    return 'Noodles & Pasta'

  // ── Biryani & Rice ───────────────────────────────────────────────────────────
  if (
    /\b(biryani|biriyani|biriani|beryani|fried rice|pulao|pulav|pilaf|pilau|khichdi|khichri|congee)\b/.test(
      n
    )
  )
    return 'Biryani & Rice'
  // "rice" as a main component (but not in dessert names)
  if (/\brice\b/.test(n) && !/\b(rice pudding|rice payasam|kheer|rice cake|rice paper|flattened rice)\b/.test(n))
    return 'Biryani & Rice'

  // ── Bread ────────────────────────────────────────────────────────────────────
  // Note: dosa and uttapam go to Snack & Street Food below, idli/vada too
  if (
    /\b(naan|roti|paratha|paratha|lachha|laccha|kulcha|puri|poori|bhatura|bhatoora|chapati|chapatti|roomali|tandoori roti|garlic bread|flatbread|thepla|puran poli|appam|phulka|tawa roti)\b/.test(
      n
    )
  )
    return 'Bread'

  // ── Dessert ──────────────────────────────────────────────────────────────────
  if (
    /\b(halwa|kheer|kulfi|gulab jamun|rasmalai|rasgulla|jalebi|imarti|ladoo|laddoo|barfi|burfi|mithai|payasam|phirni|shrikhand|malpua|modak|peda|pedha|gelato|sorbet|ice cream|cake|brownie|pastry|tart|pudding|mousse|tiramisu|cheesecake|panna cotta|waffle|crepe|churro|doughnut|donut|dessert|sundae|fudge|toffee|candy|popsicle|anjeer roll|khurma|seviyan|basundi|rabdi|rabri|firni|souffl|fondant|parfait|macaron|truffle cake|lava cake|swiss roll|mochi|tres leches|baklava|kunafa|khubani|shahi tukda|double ka meetha|kalakand|milk cake|sandesh|chhena|cham cham|pantua|mishti doi|bengali sweet|sweet shop)\b/.test(
      n
    )
  )
    return 'Dessert'
  // standalone "sweet" dish names
  if (/^(sweet|sweets|mithai)$/.test(n)) return 'Dessert'

  // ── Side ─────────────────────────────────────────────────────────────────────
  if (
    /\b(raita|chutney|pickle|papad|papadum|pappadam|achaar|achar|salan|dip|ketchup|mayo|mayonnaise|relish|salsa|guacamole|ranch|aioli|sour cream|tartar sauce|hot sauce|sriracha|wasabi|soy sauce)\b/.test(
      n
    )
  )
    return 'Side'
  // Fries as a standalone side
  if (/\b(fries|french fries|masala fries|cheese fries|loaded fries|sweet potato fries|waffle fries)\b/.test(n))
    return 'Side'

  // ── Thali & Meals ────────────────────────────────────────────────────────────
  if (/\b(thali|meals|full meal|dal bati churma platter)\b/.test(n)) return 'Thali & Meals'
  // "meal" or "platter" as the main identifier
  if (/\bmeal\b/.test(n) && !/\b(set meal)\b/.test(n)) return 'Thali & Meals'

  // ── Combos & Offers ──────────────────────────────────────────────────────────
  if (/\b(combo|deal|offer|set meal|family pack|bucket|value meal|party pack|starter pack)\b/.test(n))
    return 'Combos & Offers'
  // "platter" alone — only if it doesn't contain a more specific category keyword
  if (
    /\bplatter\b/.test(n) &&
    /\b(mixed|veg|non veg|party|sharing)\b/.test(n) &&
    !/\b(kebab|kabab|tikka|tandoori|seekh|grill|bbq)\b/.test(n)
  )
    return 'Combos & Offers'

  // ── Snack & Street Food ──────────────────────────────────────────────────────
  if (
    /\b(chaat|samosa|pani puri|panipuri|gol gappa|golgappa|bhel puri|bhel|sev puri|aloo tikki|papdi|kachori|dahi puri|pav bhaji|batata vada|vada pav|dabeli|puchka|spring roll|nugget|nuggets|fritter|popcorn|nachos|croquette|bitterballen|arancini|bruschetta|corn dog|pretzel|chips|wafers|bhajia|pakoda|pakora|poha|upma|sevai|dosa|idli|uttapam|medu vada|dahi vada|pongal|uthappam|appam with stew|sevaiyan|chole bhature|chole bhatura|bhature|bhatura bhature)\b/.test(
      n
    )
  )
    return 'Snack & Street Food'
  // vada (standalone or with a qualifier but not dahi vada which is also snack)
  if (/\bvada\b/.test(n)) return 'Snack & Street Food'
  // tikki (not tikka)
  if (/\btikki\b/.test(n) && !/\btikka\b/.test(n)) return 'Snack & Street Food'
  // cutlet
  if (/\bcutlet\b/.test(n)) return 'Snack & Street Food'
  // fingers / strips / wings as snack (but wings are starter)
  if (/\b(finger|strips|bites|poppers)\b/.test(n) && /\b(chicken|fish|paneer|cheese)\b/.test(n))
    return 'Snack & Street Food'

  // ── Salad ────────────────────────────────────────────────────────────────────
  if (/\b(salad|slaw|coleslaw|kachumber)\b/.test(n)) return 'Salad'

  // ── Kebab & Grill ────────────────────────────────────────────────────────────
  if (
    /\b(kebab|kabab|kabob|seekh|sheekh|boti|barra|bera|reshmi|galawati|galouti|kakori|champ|satay|skewer|barbeque|barbecue|bbq|smoked|grilled|tangdi|tangri|malai tikka|hariyali tikka|hara bhara kebab|shammi|shami|chapli|peshwari|adana)\b/.test(
      n
    )
  )
    return 'Kebab & Grill'
  // tikka → Kebab & Grill unless it has a curry/gravy modifier
  if (/\btikka\b/.test(n) && !/\b(masala|makhani|curry|gravy|sauce)\b/.test(n)) return 'Kebab & Grill'
  // tandoori + non-bread items
  if (/\btandoori\b/.test(n) && !/\b(roti|naan|bread|paratha)\b/.test(n)) return 'Kebab & Grill'
  // grill / roast as main descriptor
  if (/\b(grill|roast|roasted|char-grilled|chargrilled)\b/.test(n)) return 'Kebab & Grill'

  // ── Starter & Appetiser ──────────────────────────────────────────────────────
  if (/\b(soup|shorba|consommé|consomme|broth|bisque|chowder)\b/.test(n)) return 'Starter & Appetiser'
  if (
    /\b(starter|starters|appetiser|appetizer|hummus|chicken wing|wings|drumstick|peri peri|lollipop|amuse|bruschetta|calamari|escargot|oyster|mussels)\b/.test(
      n
    )
  )
    return 'Starter & Appetiser'
  // Manchurian (Indo-Chinese starter — dry form or gravy; use as starter unless "gravy" specified)
  if (/\bmanchurian\b/.test(n) && !/\bgravy\b/.test(n)) return 'Starter & Appetiser'
  // "65" dishes (Chicken 65, Fish 65, Gobi 65) are always South Indian starters
  if (/\b65\b/.test(n)) return 'Starter & Appetiser'
  // Chilli + protein (chilli chicken, chilli paneer) — dry form is starter
  if (/\bchilli\b/.test(n) && /\b(chicken|paneer|fish|prawn|gobi|mushroom|baby corn)\b/.test(n) && !/\b(gravy|oil|fry sauce)\b/.test(n))
    return 'Starter & Appetiser'

  // ── Main Course (default) ────────────────────────────────────────────────────
  return 'Main Course'
}

interface Dish {
  id: string
  name: string
  restaurantName: string
  cuisines: string[]
  [key: string]: unknown
}

const filePath = path.join(process.cwd(), 'dishes-for-categorisation.json')
const dishes: Dish[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

const categoryCounts: Record<string, number> = {}

const updated = dishes.map((dish) => {
  const category = categorize(dish.name)
  categoryCounts[category] = (categoryCounts[category] ?? 0) + 1
  return { ...dish, category }
})

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2))

console.log(`\nDone. ${updated.length} dishes updated.\n`)
console.log('Category distribution:')
for (const cat of TAXONOMY) {
  const count = categoryCounts[cat] ?? 0
  if (count > 0) {
    console.log(`  ${cat.padEnd(24)} ${count}`)
  }
}
