// Catálogo: iconos, categorías por defecto y colores. Sin dependencias de React.
import {
  Airplane, ArrowsClockwise, Baby, Backspace, Bank, Barbell, Bell, Bicycle, BookOpen, Bus, CalendarBlank, Camera,
  CaretDown, CaretLeft, CaretRight, ChartDonut, Check, CheckCircle, Clock, Coffee, Coins, Confetti, Car, DeviceMobile,
  DownloadSimple, DotsThree, Eraser, Export, Fire, Flag, Flower, ForkKnife, Gauge, GameController, GasPump, Gift,
  GearSix, Heartbeat, House, Hourglass, Info, Laptop, Lightning, ListBullets, Lock, MagnifyingGlass, MagicWand, MoonStars,
  Minus, MusicNotes, Package, PaintBrush, PawPrint, PencilSimple, Pill, PiggyBank, Plus, Quotes, Receipt, Scissors,
  ShoppingBag, ShoppingCart, SlidersHorizontal, Sparkle, Star, Sun, Tag, Target, Television, Ticket, Trash, TrendDown,
  TrendUp, Trophy, TShirt, UploadSimple, User, Wallet, Warning, WarningCircle, Wine, WifiHigh, Wrench, X,
} from '@phosphor-icons/react';

export const ICONS = {
  // categorías y metas
  food: ForkKnife, coffee: Coffee, cart: ShoppingCart, bus: Bus, car: Car, fuel: GasPump, plane: Airplane,
  home: House, bolt: Lightning, health: Heartbeat, pill: Pill, bag: ShoppingBag, shirt: TShirt, gift: Gift,
  party: Confetti, ticket: Ticket, music: MusicNotes, game: GameController, book: BookOpen, paw: PawPrint,
  gym: Barbell, phone: DeviceMobile, repeat: ArrowsClockwise, tv: Television, wifi: WifiHigh, laptop: Laptop,
  wrench: Wrench, baby: Baby, wine: Wine, bike: Bicycle, flower: Flower, scissors: Scissors, box: Package,
  tag: Tag, piggy: PiggyBank, coins: Coins, bank: Bank, trophy: Trophy, star: Star, target: Target,
  // interfaz
  plus: Plus, minus: Minus, check: Check, checkCircle: CheckCircle, x: X, pencil: PencilSimple, trash: Trash,
  search: MagnifyingGlass, caretL: CaretLeft, caretR: CaretRight, caretD: CaretDown, calendar: CalendarBlank,
  download: DownloadSimple, upload: UploadSimple, moon: MoonStars, sun: Sun, bell: Bell, camera: Camera,
  sparkle: Sparkle, user: User, gear: GearSix, receipt: Receipt, chart: ChartDonut, flag: Flag, wallet: Wallet,
  trendUp: TrendUp, trendDown: TrendDown, backspace: Backspace, warning: Warning, warningCircle: WarningCircle,
  info: Info, lock: Lock, palette: PaintBrush, quote: Quotes, clock: Clock, fire: Fire, list: ListBullets,
  sliders: SlidersHorizontal, dots: DotsThree, gauge: Gauge, hourglass: Hourglass, eraser: Eraser, export: Export,
  wand: MagicWand,
};

export const CATEGORY_ICON_CHOICES = [
  'food', 'coffee', 'cart', 'bus', 'car', 'fuel', 'plane', 'home', 'bolt', 'health', 'pill', 'bag', 'shirt', 'gift',
  'party', 'ticket', 'music', 'game', 'book', 'paw', 'gym', 'phone', 'repeat', 'tv', 'wifi', 'laptop', 'wrench',
  'baby', 'wine', 'bike', 'flower', 'scissors', 'box', 'tag',
];

export const GOAL_ICON_CHOICES = ['piggy', 'plane', 'home', 'car', 'gift', 'laptop', 'phone', 'bike', 'baby', 'book', 'star', 'trophy', 'coins', 'bank', 'target', 'wine'];

/** 8 huecos de color (validados en claro y oscuro). El 7 es el gris de "Otros". */
export const COLOR_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7];

export const DEFAULT_CATEGORIES = [
  { name: 'Comida', icon: 'food', color: 1, budget: 300 },
  { name: 'Transporte', icon: 'bus', color: 0, budget: 60 },
  { name: 'Ocio', icon: 'ticket', color: 3, budget: 100 },
  { name: 'Casa', icon: 'home', color: 2, budget: 200 },
  { name: 'Salud', icon: 'health', color: 5, budget: 50 },
  { name: 'Compras', icon: 'bag', color: 4, budget: 100 },
  { name: 'Suscripciones', icon: 'repeat', color: 6, budget: 40 },
  { name: 'Otros', icon: 'box', color: 7, budget: 50 },
];

/** Emojis de la versión 1 -> claves de icono. */
export const EMOJI_TO_ICON = {
  '🍽️': 'food', '🚌': 'bus', '🎉': 'party', '🏠': 'home', '💊': 'health', '🛍️': 'bag', '📱': 'repeat', '📦': 'box', '🏷️': 'tag',
};

export const ACCENTS = {
  emerald: { label: 'Esmeralda', swatch: ['#5af0b4', '#1fc98a', '#0b8a5c'] },
  violet: { label: 'Violeta', swatch: ['#c7a6ff', '#8e6bff', '#5a35d8'] },
  gold: { label: 'Oro', swatch: ['#ffe08a', '#f0b429', '#b9822a'] },
};

export const DEFAULT_SETTINGS = {
  key: 'app',
  userName: '',
  alertThreshold: 1,
  tone: 'warm',
  theme: 'dark',
  accent: 'emerald',
  onboarded: false,
  haptics: true,
};
