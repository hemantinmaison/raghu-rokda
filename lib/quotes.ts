export type QuoteTheme = "debt" | "freedom" | "earning" | "how-money-works" | "from-books";

export type Quote = {
  text: string;
  author: string;
  source?: string;
  theme: QuoteTheme;
};

export type ThemeMeta = {
  id: QuoteTheme;
  label: string;
  bg: string;
  text: string;
};

export const QUOTE_THEMES: ThemeMeta[] = [
  { id: "debt", label: "Clearing Debt", bg: "#ffe2dd", text: "#5d1715" },
  { id: "freedom", label: "Financial Freedom", bg: "#dbeddb", text: "#1c3829" },
  { id: "earning", label: "Earning Money", bg: "#d3e5ef", text: "#183347" },
  { id: "how-money-works", label: "How Money Works", bg: "#e8deee", text: "#3c2e44" },
  { id: "from-books", label: "From the Books", bg: "#fdecc8", text: "#4a3919" }
];

export const themeMeta = (id: QuoteTheme): ThemeMeta =>
  QUOTE_THEMES.find((theme) => theme.id === id) ?? QUOTE_THEMES[0];

export const QUOTES: Quote[] = [
  // --- Clearing Debt ---
  { theme: "debt", text: "Rather go to bed without dinner than to rise in debt.", author: "Benjamin Franklin" },
  { theme: "debt", text: "Think what you do when you run in debt; you give to another power over your liberty.", author: "Benjamin Franklin" },
  { theme: "debt", text: "The borrower is slave to the lender.", author: "Proverbs 22:7" },
  { theme: "debt", text: "A man in debt is so far a slave.", author: "Ralph Waldo Emerson" },
  { theme: "debt", text: "Debt is the slavery of the free.", author: "Publilius Syrus" },
  { theme: "debt", text: "You must gain control over your money or the lack of it will forever control you.", author: "Dave Ramsey" },
  { theme: "debt", text: "Debt is normal. Be weird.", author: "Dave Ramsey" },
  { theme: "debt", text: "Some debts are fun when you are acquiring them, but none are fun when you set about retiring them.", author: "Ogden Nash" },
  { theme: "debt", text: "Never spend your money before you have it.", author: "Thomas Jefferson" },
  { theme: "debt", text: "If you would know the value of money, go and try to borrow some.", author: "Benjamin Franklin" },
  { theme: "debt", text: "When you get into a tight place and everything goes against you, never give up then, for that is just the place and time that the tide will turn.", author: "Harriet Beecher Stowe" },
  { theme: "debt", text: "The first rule of holes: when you're in one, stop digging.", author: "Molly Ivins" },
  { theme: "debt", text: "Out of debt, out of danger.", author: "English Proverb" },
  { theme: "debt", text: "Interest on debts grow without rain.", author: "Yiddish Proverb" },
  { theme: "debt", text: "Freedom from debt is worth more than any amount you can earn.", author: "Mark Cuban" },

  // --- Financial Freedom ---
  { theme: "freedom", text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
  { theme: "freedom", text: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
  { theme: "freedom", text: "He who knows that enough is enough will always have enough.", author: "Lao Tzu" },
  { theme: "freedom", text: "Money is a terrible master but an excellent servant.", author: "P. T. Barnum" },
  { theme: "freedom", text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { theme: "freedom", text: "Too many people spend money they haven't earned, to buy things they don't want, to impress people they don't like.", author: "Will Rogers" },
  { theme: "freedom", text: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.", author: "Dave Ramsey" },
  { theme: "freedom", text: "The real measure of your wealth is how much you'd be worth if you lost all your money.", author: "Bernard Meltzer" },
  { theme: "freedom", text: "Being rich is having money; being wealthy is having time.", author: "Margaret Bonnano" },
  { theme: "freedom", text: "That man is richest whose pleasures are cheapest.", author: "Henry David Thoreau" },
  { theme: "freedom", text: "The goal isn't more money. The goal is living life on your terms.", author: "Chris Brogan" },
  { theme: "freedom", text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
  { theme: "freedom", text: "Money grows on the tree of persistence.", author: "Japanese Proverb" },

  // --- Earning Money ---
  { theme: "earning", text: "Never depend on a single income. Make an investment to create a second source.", author: "Warren Buffett" },
  { theme: "earning", text: "If you don't find a way to make money while you sleep, you will work until you die.", author: "Warren Buffett" },
  { theme: "earning", text: "Formal education will make you a living; self-education will make you a fortune.", author: "Jim Rohn" },
  { theme: "earning", text: "The best investment you can make is in yourself.", author: "Warren Buffett" },
  { theme: "earning", text: "Seek wealth, not money or status.", author: "Naval Ravikant" },
  { theme: "earning", text: "You're not going to get rich renting out your time. You must own equity to gain your financial freedom.", author: "Naval Ravikant" },
  { theme: "earning", text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { theme: "earning", text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { theme: "earning", text: "Don't work for money; make money work for you.", author: "Robert Kiyosaki" },
  { theme: "earning", text: "Money often costs too much.", author: "Ralph Waldo Emerson" },
  { theme: "earning", text: "It's not about having lots of money. It's about knowing how to manage it.", author: "Tyler Perry" },
  { theme: "earning", text: "Try not to become a person of success, but rather try to become a person of value.", author: "Albert Einstein" },
  { theme: "earning", text: "I will tell you the secret to getting rich on Wall Street: be fearful when others are greedy, be greedy when others are fearful.", author: "Warren Buffett" },

  // --- How Money Works ---
  { theme: "how-money-works", text: "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.", author: "Albert Einstein (attributed)" },
  { theme: "how-money-works", text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { theme: "how-money-works", text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { theme: "how-money-works", text: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
  { theme: "how-money-works", text: "Price is what you pay. Value is what you get.", author: "Warren Buffett" },
  { theme: "how-money-works", text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
  { theme: "how-money-works", text: "Inflation is taxation without legislation.", author: "Milton Friedman" },
  { theme: "how-money-works", text: "Know what you own, and know why you own it.", author: "Peter Lynch" },
  { theme: "how-money-works", text: "The individual investor should act consistently as an investor and not as a speculator.", author: "Benjamin Graham" },
  { theme: "how-money-works", text: "In investing, what is comfortable is rarely profitable.", author: "Robert Arnott" },
  { theme: "how-money-works", text: "The four most dangerous words in investing are: 'this time it's different.'", author: "Sir John Templeton" },
  { theme: "how-money-works", text: "Time in the market beats timing the market.", author: "Investing Adage" },
  { theme: "how-money-works", text: "A budget is telling your money where to go instead of wondering where it went.", author: "John C. Maxwell" },

  // --- From the Books ---
  { theme: "from-books", text: "A part of all you earn is yours to keep.", author: "George S. Clason", source: "The Richest Man in Babylon" },
  { theme: "from-books", text: "Pay yourself first.", author: "George S. Clason", source: "The Richest Man in Babylon" },
  { theme: "from-books", text: "It's not how much money you make, but how much money you keep.", author: "Robert Kiyosaki", source: "Rich Dad Poor Dad" },
  { theme: "from-books", text: "The rich buy assets. The poor and middle class buy liabilities that they think are assets.", author: "Robert Kiyosaki", source: "Rich Dad Poor Dad" },
  { theme: "from-books", text: "Doing well with money has little to do with how smart you are and a lot to do with how you behave.", author: "Morgan Housel", source: "The Psychology of Money" },
  { theme: "from-books", text: "Wealth is what you don't see.", author: "Morgan Housel", source: "The Psychology of Money" },
  { theme: "from-books", text: "Spending money to show people how much money you have is the fastest way to have less money.", author: "Morgan Housel", source: "The Psychology of Money" },
  { theme: "from-books", text: "The highest form of wealth is the ability to wake up every morning and say, 'I can do whatever I want today.'", author: "Morgan Housel", source: "The Psychology of Money" },
  { theme: "from-books", text: "The proven path to wealth is to spend less than you earn and invest the surplus.", author: "J. L. Collins", source: "The Simple Path to Wealth" },
  { theme: "from-books", text: "Whatever the mind can conceive and believe, it can achieve.", author: "Napoleon Hill", source: "Think and Grow Rich" },
  { theme: "from-books", text: "The starting point of all achievement is desire.", author: "Napoleon Hill", source: "Think and Grow Rich" },
  { theme: "from-books", text: "Wealth is the result of a lifestyle of hard work, perseverance, planning, and self-discipline.", author: "Thomas J. Stanley", source: "The Millionaire Next Door" },
  { theme: "from-books", text: "Big hat, no cattle.", author: "Thomas J. Stanley", source: "The Millionaire Next Door" },
  { theme: "from-books", text: "Annual income twenty pounds, annual expenditure nineteen and six, result happiness. Annual income twenty pounds, annual expenditure twenty pounds ought and six, result misery.", author: "Charles Dickens", source: "David Copperfield" },
  { theme: "from-books", text: "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.", author: "Ayn Rand", source: "Atlas Shrugged" }
];
