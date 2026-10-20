// Planificateur de menus normands - JavaScript (compiled from TypeScript)

// Types (removed for JS)
// interface Meal { entree?: string; main: string; veggies?: string; starches?: string; dessert?: string; guests: number; planned: boolean; }
// type Slot = 'midi' | 'soir';
// interface DayPlan { day: string; meals: Record<Slot, Meal>; }

/** Data & persistence **/
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const SLOTS = ['midi', 'soir'];
const STORAGE_KEY = 'normandyMenuPlan';

function loadPlan() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyPlan();
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 7) return parsed;
  } catch (e) {
    console.warn('Corrupted plan data, resetting');
  }
  return createEmptyPlan();
}
function savePlan(plan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}
function createEmptyPlan() {
  return DAYS.map(d => ({
    day: d,
    meals: {
      midi: { main: '', guests: 1, planned: false },
      soir: { main: '', guests: 1, planned: false }
    }
  }));
}
/** UI helpers **/
function $(selector) { return document.querySelector(selector); }
function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}
/** Render **/
function renderForm(plan) {
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
      const makeField = (labelText, name, placeholder = '', type = 'text') => {
        const wrapper = createEl('div');
        const label = createEl('label');
        label.htmlFor = name;
        label.textContent = labelText;
        wrapper.appendChild(label);
        const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
        input.id = name;
        input.name = name;
        input.placeholder = placeholder;
        if (type !== 'textarea') input.type = type;
        const value = meal[name];
        if (value !== undefined && value !== null) input.value = value;
        wrapper.appendChild(input);
        const err = createEl('div', 'error');
        err.id = name + '-error';
        wrapper.appendChild(err);
        return wrapper;
      };
      dayDiv.appendChild(makeField('Entrée (facultatif)', `${day.day}-${slot}-entree`, 'Ex: Salade de mâche'));
      dayDiv.appendChild(makeField('Plat principal *', `${day.day}-${slot}-main`, 'Ex: Cabillaud au beurre'));
      dayDiv.appendChild(makeField('Légume(s) (facultatif)', `${day.day}-${slot}-veggies`, 'Ex: Haricots verts'));
      dayDiv.appendChild(makeField('Féculent(s) (facultatif)', `${day.day}-${slot}-starches`, 'Ex: Pommes de terre'));
      dayDiv.appendChild(makeField('Dessert (facultatif)', `${day.day}-${slot}-dessert`, 'Ex: Tarte aux pommes'));
      dayDiv.appendChild(makeField('Nombre de convives * (1‑6)', `${day.day}-${slot}-guests`, '', 'number'));
    });
    container.appendChild(dayDiv);
  });
  const validateBtn = createEl('button', 'button', 'Valider les menus');
  validateBtn.type = 'button';
  validateBtn.addEventListener('click', () => onValidate(plan));
  form.appendChild(validateBtn);
  container.appendChild(form);
}
function onValidate(plan) {
  document.querySelectorAll('.error').forEach(el => el.textContent = '');
  let hasError = false;
  plan.forEach(day => {
    SLOTS.forEach(slot => {
      const prefix = `${day.day}-${slot}`;
      const meal = day.meals[slot];
      const getVal = id => document.getElementById(id).value.trim();
      const entree = getVal(`${prefix}-entree`);
      const main = getVal(`${prefix}-main`);
      const veggies = getVal(`${prefix}-veggies`);
      const starches = getVal(`${prefix}-starches`);
      const dessert = getVal(`${prefix}-dessert`);
      const guestsStr = getVal(`${prefix}-guests`);
      const guests = parseInt(guestsStr, 10) || 0;
      const isPlanned = entree || main || veggies || starches || dessert;
      meal.planned = isPlanned;
      meal.entree = entree || undefined;
      meal.main = main || '';
      meal.veggies = veggies || undefined;
      meal.starches = starches || undefined;
      meal.dessert = dessert || undefined;
      meal.guests = guests;
      if (isPlanned) {
        if (!main) {
          document.getElementById(`${prefix}-main-error`).textContent = 'Le plat principal est obligatoire.';
          hasError = true;
        }
        if (guests < 1 || guests > 6) {
          document.getElementById(`${prefix}-guests-error`).textContent = 'Le nombre de convives doit être entre 1 et 6.';
          hasError = true;
        }
      }
    });
  });
  if (hasError) return;
  savePlan(plan);
  renderSummary(plan);
}
function renderSummary(plan) {
  const container = $('#app');
  container.innerHTML = '';
  const summaryDiv = createEl('div', 'summary');
  const title = createEl('h2', null, 'Récapitulatif des menus');
  summaryDiv.appendChild(title);
  plan.forEach(day => {
    const daySection = createEl('div', 'app-card');
    const dayHeader = createEl('h3', null, day.day);
    daySection.appendChild(dayHeader);
    SLOTS.forEach(slot => {
      const meal = day.meals[slot];
      const slotHeader = createEl('h4', null, slot.charAt(0).toUpperCase() + slot.slice(1));
      daySection.appendChild(slotHeader);
      if (!meal.planned) {
        daySection.appendChild(createEl('p', null, 'Pas de menu prévu.'));
        return;
      }
      const ul = createEl('ul');
      const addItem = (label, value) => {
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
  const backBtn = createEl('button', 'button', 'Modifier');
  backBtn.type = 'button';
  backBtn.addEventListener('click', () => renderForm(plan));
  summaryDiv.appendChild(backBtn);
  container.appendChild(summaryDiv);
}
// Initialise
renderForm(loadPlan());
