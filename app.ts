// Planificateur de menus normands - TypeScript

/** Types **/
interface Meal {
  entree?: string;
  main: string;
  veggies?: string;
  starches?: string;
  dessert?: string;
  guests: number;
  planned: boolean; // true if any field besides guests is filled
}

type Slot = 'midi' | 'soir';
interface DayPlan {
  day: string; // e.g., "Lundi"
  meals: Record<Slot, Meal>;
}

/** Data & persistence **/
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const SLOTS: Slot[] = ['midi', 'soir'];

const STORAGE_KEY = 'normandyMenuPlan';

function loadPlan(): DayPlan[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyPlan();
  try {
    const parsed = JSON.parse(raw) as DayPlan[];
    // basic validation / migration
    if (Array.isArray(parsed) && parsed.length === 7) return parsed;
  } catch (e) {
    console.warn('Corrupted plan data, resetting');
  }
  return createEmptyPlan();
}

function savePlan(plan: DayPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

function createEmptyPlan(): DayPlan[] {
  return DAYS.map(d => ({
    day: d,
    meals: {
      midi: { main: '', guests: 1, planned: false },
      soir: { main: '', guests: 1, planned: false },
    },
  }));
}

/** UI helpers **/
function $(selector: string): HTMLElement { return document.querySelector(selector) as HTMLElement; }
function createEl(tag: keyof HTMLElementTagNameMap, className?: string, text?: string): HTMLElement {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

/** Render **/
function renderForm(plan: DayPlan[]) {
  const container = $('#app');
  container.innerHTML = '';
  const form = createEl('form');

  plan.forEach(day => {
    const dayDiv = createEl('div', 'app-card');
    const dayTitle = createEl('h2', 'day-title', day.day);
    dayDiv.appendChild(dayTitle);

    SLOTS.forEach(slot => {
      const meal = day.meals[slot];
      const slotHeader = createEl('h3', 'slot-header', slot.charAt(0).toUpperCase() + slot.slice(1));
      dayDiv.appendChild(slotHeader);

      // Helper to create input with label
      const makeField = (labelText: string, name: string, placeholder?: string, type: string = 'text') => {
        const wrapper = createEl('div');
        const label = createEl('label');
        label.htmlFor = name;
        label.textContent = labelText;
        wrapper.appendChild(label);
        const input = document.createElement(type === 'textarea' ? 'textarea' : 'input') as HTMLInputElement | HTMLTextAreaElement;
        input.id = name;
        input.name = name;
        input.placeholder = placeholder || '';
        if (type !== 'textarea') input.type = type;
        // fill existing
        const value = (meal as any)[name as keyof Meal];
        if (value !== undefined && value !== null) input.value = value;
        wrapper.appendChild(input);
        // error placeholder
        const err = createEl('div', 'error');
        err.id = name + '-error';
        wrapper.appendChild(err);
        return wrapper;
      };

      // optional fields
      dayDiv.appendChild(makeField('Entrée (facultatif)', `${day.day}-${slot}-entree`, 'Ex: Salade de mâche'));
      // main (required if any field filled)
      dayDiv.appendChild(makeField('Plat principal *', `${day.day}-${slot}-main`, 'Ex: Cabillaud au beurre'));
      dayDiv.appendChild(makeField('Légume(s) (facultatif)', `${day.day}-${slot}-veggies`, 'Ex: Haricots verts'));
      dayDiv.appendChild(makeField('Féculent(s) (facultatif)', `${day.day}-${slot}-starches`, 'Ex: Pommes de terre'));
      dayDiv.appendChild(makeField('Dessert (facultatif)', `${day.day}-${slot}-dessert`, 'Ex: Tarte aux pommes'));
      dayDiv.appendChild(makeField('Nombre de convives * (1‑6)', `${day.day}-${slot}-guests`, '', 'number'));
    });
    container.appendChild(dayDiv);
  });

  const validateBtn = createEl('button', 'button', 'Valider les menus') as HTMLButtonElement;
  validateBtn.type = 'button';
  validateBtn.addEventListener('click', () => onValidate(plan));
  form.appendChild(validateBtn);
  container.appendChild(form);
}

function onValidate(plan: DayPlan[]) {
  // clear previous errors
  document.querySelectorAll('.error').forEach(el => (el.textContent = ''));
  let hasError = false;

  // sync UI values back into plan
  plan.forEach(day => {
    SLOTS.forEach(slot => {
      const prefix = `${day.day}-${slot}`;
      const meal = day.meals[slot];
      const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement).value.trim();
      const entree = getVal(`${prefix}-entree`);
      const main = getVal(`${prefix}-main`);
      const veggies = getVal(`${prefix}-veggies`);
      const starches = getVal(`${prefix}-starches`);
      const dessert = getVal(`${prefix}-dessert`);
      const guestsStr = getVal(`${prefix}-guests`);
      const guests = parseInt(guestsStr, 10) || 0;

      // Determine if slot is planned (any field except guests filled)
      const isPlanned = entree || main || veggies || starches || dessert;
      meal.planned = isPlanned;

      // Populate fields
      meal.entree = entree || undefined;
      meal.main = main || '';
      meal.veggies = veggies || undefined;
      meal.starches = starches || undefined;
      meal.dessert = dessert || undefined;
      meal.guests = guests;

      // Validation only for planned slots
      if (isPlanned) {
        if (!main) {
          document.getElementById(`${prefix}-main-error`)!.textContent = 'Le plat principal est obligatoire.';
          hasError = true;
        }
        if (guests < 1 || guests > 6) {
          document.getElementById(`${prefix}-guests-error`)!.textContent = 'Le nombre de convives doit être entre 1 et 6.';
          hasError = true;
        }
      }
    });
  });

  if (hasError) {
    // keep form visible, errors shown
    return;
  }

  // Save and show summary
  savePlan(plan);
  renderSummary(plan);
}

function renderSummary(plan: DayPlan[]) {
  const container = $('#app');
  container.innerHTML = '';
  const summaryDiv = createEl('div', 'summary');
  const title = createEl('h2', undefined, 'Récapitulatif des menus');
  summaryDiv.appendChild(title);

  plan.forEach(day => {
    const daySection = createEl('div', 'app-card');
    const dayHeader = createEl('h3', undefined, day.day);
    daySection.appendChild(dayHeader);

    SLOTS.forEach(slot => {
      const meal = day.meals[slot];
      const slotHeader = createEl('h4', undefined, slot.charAt(0).toUpperCase() + slot.slice(1));
      daySection.appendChild(slotHeader);

      if (!meal.planned) {
        const notPlanned = createEl('p', undefined, 'Pas de menu prévu.');
        daySection.appendChild(notPlanned);
        return;
      }

      const ul = createEl('ul');
      const addItem = (label: string, value?: string) => {
        if (value) {
          const li = createEl('li');
          li.textContent = `${label}: ${value}`;
          ul.appendChild(li);
        }
      };
      addItem('Entrée', meal.entree);
      addItem('Plat principal', meal.main);
      addItem('Légumes', meal.veggies);
      addItem('Féculents', meal.starches);
      addItem('Dessert', meal.dessert);
      addItem('Nombre de convives', meal.guests.toString());
      daySection.appendChild(ul);
    });
    summaryDiv.appendChild(daySection);
  });

  const backBtn = createEl('button', 'button', 'Modifier') as HTMLButtonElement;
  backBtn.type = 'button';
  backBtn.addEventListener('click', () => renderForm(plan));
  summaryDiv.appendChild(backBtn);
  container.appendChild(summaryDiv);
}

// Initialisation
const storedPlan = loadPlan();
renderForm(storedPlan);

