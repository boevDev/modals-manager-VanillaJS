# Modals.js

Универсальный менеджер модальных окон на JavaScript.  
Поддерживает стек модалок, плавные анимации, кастомный скролл и блокировку скролла страницы. Полностью настраивается через CSS-переменные и готов к переносу между проектами.

---

## ⚡ Особенности

- Простая интеграция: подключил CSS и JS — модалки работают из коробки.
- Стек модалок: можно открывать несколько модалок, последняя будет поверх.
- Плавные анимации открытия/закрытия с scale эффектом.
- Кастомный скролл для контента модалки с переменными для ширины, радиуса и цвета.
- Блокировка скролла страницы при открытой модалке.
- Полностью настраиваемый через CSS-переменные.
- Hooks для `beforeOpen`, `open`, `beforeClose`, `close`.

---

# 🚀 Использование

## Инициализация

```js
import { createModalManager } from './modals.js';

const modalManager = createModalManager({
    hooks: {
        beforeOpen: (modal, id) => console.log('Перед открытием:', id),
        open: (modal, id) => console.log('Открыто:', id),
        beforeClose: (modal, id) => console.log('Перед закрытием:', id),
        close: (modal, id) => console.log('Закрыто:', id),
    }
});
```

## Открытие / закрытие модалок

```js
modalManager.open('pdf-modal');   // открыть модалку по ID
modalManager.close('pdf-modal');  // закрыть модалку по ID
modalManager.closeAll();          // закрыть все открытые модалки
modalManager.isOpen('pdf-modal'); // проверить, открыта ли модалка
modalManager.getActive();         // получить ID активной модалки
```

## HTML

```html
<div class="modal" id="pdf-modal">
    <div class="modal__container">
        <div class="modal__content" id="pdf-container"></div>
        <button type="button" class="modal__closer" data-modal-close></button>
    </div>
</div>

<button data-modal-target="pdf-modal">Открыть PDF</button>
```

## 🎨 Настройка через CSS

Все параметры модалки задаются через CSS-переменные:

```css
:root {
    --modal-space-h: 240px;
    --modal-space-w: 240px;
    --modal-padding-h: 64px;
    --modal-padding-w: 64px;

    --transition-modal: 0.5s cubic-bezier(0.25, 1, 0.5, 1);

    --modal-backdrop: rgba(0,0,0,0.5);
    --modal-container-bg: #fff;
    --modal-shadow: rgba(0,0,0,0.6);

    --scroll-width: 8px;
    --scroll-radius: 16rem;
    --scroll-thumb: #8080805a;
    --scroll-thumb-hover: #8080806a;
    --scroll-thumb-active: #8080807a;
    --scroll-space: 40px;

    --modal-scale-start: 0.95;
    --modal-scale-end: 1;
}
```

Изменяя эти переменные, можно быстро адаптировать модалки под любой проект.

