# Дизайн-система проекта: Аудит и предложения

Данный документ представляет собой аудит текущего состояния дизайн-системы проекта "Almaty Posters" и предлагает структуру для ее унификации.

## Часть 1: Инвентаризация текущих дизайн-токенов

### Цвета (Colors)
Базовые цвета определены в `tailwind.config.ts` и `styles/globals.css`:
- `background`: #FFFFFF
- `surface`: #FAFAFA
- `primary`: #1A1A1A (текст: --text-primary: #111111)
- `secondary`: #525252 (текст: --text-secondary: #525252)
- `secondary-light`: #999999
- `border`: #E5E5E5
- `surface-secondary`: #F2F2F2
- `surface-tertiary`: #E8E8E8

### Типографика (Typography)
- Шрифт: Inter
- Веса шрифтов (из Google Fonts): 300, 400, 500, 600, 700, 800, 900
- Размеры (стандартные Tailwind, расширенные): проект использует стандартные классы Tailwind (например, `text-sm`, `text-lg`, `text-xl`), явные кастомные размеры в конфиге не заданы.

### Границы (Border Radius)
- `sm`: 4px
- `md`: 8px
- `lg`: 12px
- `xl`: 16px
- `2xl`: 24px
- `full`: 9999px

### Тени (Shadows)
- `subtle`: `0 1px 2px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03)`
- `card`: `0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)`
- `elevated`: `0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.05)`
- `glow`: `0 0 20px rgba(0,0,0,0.05)`

### Интервалы (Spacing)
Стандартные Tailwind + кастомные:
- `18`: 4.5rem
- `22`: 5.5rem
- `30`: 7.5rem

### Анимации и движение (Animations & Motion)
В `tailwind.config.ts`:
- Duration: 400ms (`fade-in`), 600ms (`slide-up`)
- Easing: 
    - `ease-out-expo`: `cubic-bezier(0.16, 1, 0.3, 1)`
    - `ease-in-expo`: `cubic-bezier(0.7, 0, 0.84, 0)`
    - `spring-gentle`: `cubic-bezier(0.34, 1.56, 0.64, 1)`

В `lib/motion/tokens.ts`:
- Duration (секунды): `fast`: 0.3, `normal`: 0.6, `slow`: 0.8, `hero`: 1.0, `modal`: 0.5
- Springs: `soft`, `normal`, `stiff`, `bouncy` с различными параметрами stiffness/damping.
- Eases (Framer Motion): `expoOut`, `expoIn`, `gentle`, `premium`.

---

## Часть 2: Анализ компонентов (по паттернам)

*Примечание: Аудит основан на использовании общих компонентов в `components/`.*

- **Кнопки (Buttons):** Используют масштабирование при hover/tap (scale: 1.015 / 0.985) и spring-анимацию `normal` (stiffness: 150, damping: 25).
- **Карточки (Cards):** Используют тень `card`, `border-radius: lg` или `xl`, фоновый цвет `surface` или `background`.
- **Инпуты (Inputs):** Не имеют единого компонента с жестко заданным стилем в `tailwind.config`, стилизуются преимущественно инлайново или через утилитарные классы Tailwind.

---

## Часть 3: Предложение по унификации (Design System Proposal)

Текущая система хорошо структурирована, но фрагментирована между CSS/Tailwind и JS-токенами.

1. **Единый источник истины:** Перенести все JS-токены из `lib/motion/tokens.ts` в `tailwind.config.ts` (через `theme.extend` или плагины), чтобы использовать их как Tailwind-классы (`duration-fast`, `ease-premium`) и как JS-константы.
2. **Типографическая шкала:** Ограничить использование весов шрифтов до (400, 500, 600, 700) для поддержания чистоты стиля, если текущий проект не требует большего.
3. **Компонентная библиотека:** Создать базовые компоненты (Button, Input, Card) с жестко заданными вариациями (primary, secondary, ghost) вместо повторения Tailwind-классов в каждом месте.
4. **Цветовая палитра:** Использовать переменные CSS для всех цветов, чтобы обеспечить легкую возможность реализации Dark Mode в будущем.
