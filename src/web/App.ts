import { NameGen } from '@gi7b/namegen';
import { PlaceGen } from '@gi7b/placegen';
import { FactionGen } from '@gi7b/factiongen';
import type { Gender, LcWeights } from '@gi7b/shared';

const LC_OPTIONS = [
  { id: 'en-us', label: 'American English' },
  { id: 'en-gb', label: 'British English' },
  { id: 'en-ie', label: 'Irish English' },
  { id: 'en-au', label: 'Australian English' },
  { id: 'en-ca', label: 'Canadian English' },
  { id: 'ja-jp', label: 'Japanese' },
  { id: 'zh-cn', label: 'Chinese (Mandarin)' },
  { id: 'de-de', label: 'German' },
  { id: 'fr-fr', label: 'French' },
  { id: 'es-es', label: 'Spanish' },
  { id: 'es-mx', label: 'Mexican Spanish' },
  { id: 'ar-sa', label: 'Arabic (Gulf)' },
  { id: 'ar-eg', label: 'Arabic (Egyptian)' },
  { id: 'ru-ru', label: 'Russian' },
  { id: 'pl-pl', label: 'Polish' },
  { id: 'it-it', label: 'Italian' },
  { id: 'nl-nl', label: 'Dutch' },
  { id: 'sv-se', label: 'Swedish' },
  { id: 'fi-fi', label: 'Finnish' },
  { id: 'ko-kr', label: 'Korean' },
  { id: 'hi-in', label: 'Hindi' },
  { id: 'tl-ph', label: 'Tagalog' },
  { id: 'no-no', label: 'Norwegian' },
];

export class App {
  private root: HTMLElement;
  private currentTab = 'names';

  constructor(root: HTMLElement) {
    this.root = root;
  }

  mount() {
    this.root.innerHTML = `
      <header class="app-header">
        <h1>🌍 GI7B World Builder</h1>
        <span class="subtitle">Procedural worlds in your pocket</span>
      </header>
      <nav class="nav-tabs">
        <button class="nav-tab active" data-tab="names">👤 Names</button>
        <button class="nav-tab" data-tab="places">🗺️ Places</button>
        <button class="nav-tab" data-tab="factions">⚔️ Factions</button>
      </nav>
      <main class="main-content">
        <div class="panel active" id="panel-names"></div>
        <div class="panel" id="panel-places"></div>
        <div class="panel" id="panel-factions"></div>
      </main>
    `;

    this.bindTabs();
    this.renderNamesPanel();
    this.renderPlacesPanel();
    this.renderFactionsPanel();
  }

  private bindTabs() {
    const tabs = this.root.querySelectorAll('.nav-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const id = tab.getAttribute('data-tab')!;
        this.switchTab(id);
      });
    });
  }

  private switchTab(id: string) {
    this.currentTab = id;
    this.root.querySelectorAll('.nav-tab').forEach((t) => t.classList.toggle('active', t.getAttribute('data-tab') === id));
    this.root.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === `panel-${id}`));
  }

  /* ===========================
     NAMES PANEL
     =========================== */
  private renderNamesPanel() {
    const panel = this.root.querySelector<HTMLDivElement>('#panel-names')!;
    panel.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="icon">👤</span> Personal Name Generator</div>
        <div class="form-group">
          <label>Primary Culture</label>
          <select id="name-lc1">${LC_OPTIONS.map((lc) => `<option value="${lc.id}">${lc.label}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label>Secondary Culture (Drift)</label>
          <select id="name-lc2">${LC_OPTIONS.map((lc) => `<option value="${lc.id}">${lc.label}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label>Gender</label>
          <select id="name-gender">
            <option value="">Random</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        <div class="form-group">
          <label>Count</label>
          <input type="number" id="name-count" value="5" min="1" max="50" />
        </div>
        <div class="form-group">
          <label>Seed (optional)</label>
          <input type="number" id="name-seed" value="" placeholder="Leave empty for random" />
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="btn-gen-names">Generate Names</button>
          <button class="btn btn-secondary" id="btn-clear-names">Clear</button>
        </div>
      </div>
      <div id="name-results" class="result-list"></div>
    `;

    panel.querySelector('#btn-gen-names')!.addEventListener('click', () => this.generateNames());
    panel.querySelector('#btn-clear-names')!.addEventListener('click', () => {
      panel.querySelector<HTMLDivElement>('#name-results')!.innerHTML = '';
    });
  }

  private generateNames() {
    const lc1 = this.root.querySelector<HTMLSelectElement>('#name-lc1')!.value;
    const lc2 = this.root.querySelector<HTMLSelectElement>('#name-lc2')!.value;
    const gender = this.root.querySelector<HTMLSelectElement>('#name-gender')!.value as Gender | '';
    const count = parseInt(this.root.querySelector<HTMLInputElement>('#name-count')!.value, 10) || 5;
    const seedVal = this.root.querySelector<HTMLInputElement>('#name-seed')!.value;
    const seed = seedVal ? parseInt(seedVal, 10) : Date.now();

    const weights: LcWeights = { [lc1]: 3, [lc2]: 1 };
    const gen = new NameGen({ weights, seed });
    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      const name = gen.generateName({ gender: gender || undefined });
      results.push(`
        <div class="result-item">
          <div>
            <div class="result-name">${name.fullName}</div>
            <div class="result-meta">Given: ${name.given.name} · Family: ${name.family.name}</div>
          </div>
          <div class="result-detail">
            Base: ${name.given.base_lc} · Drift: ${name.given.drift_lc} · Lvl ${name.given.drift_level}
          </div>
        </div>
      `);
    }

    this.root.querySelector<HTMLDivElement>('#name-results')!.innerHTML = results.join('');
  }

  /* ===========================
     PLACES PANEL
     =========================== */
  private renderPlacesPanel() {
    const panel = this.root.querySelector<HTMLDivElement>('#panel-places')!;
    panel.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="icon">🗺️</span> Place Name Generator</div>
        <div class="form-group">
          <label>Primary Culture</label>
          <select id="place-lc1">${LC_OPTIONS.map((lc) => `<option value="${lc.id}">${lc.label}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label>Secondary Culture (Drift)</label>
          <select id="place-lc2">${LC_OPTIONS.map((lc) => `<option value="${lc.id}">${lc.label}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="place-type">
            <option value="star_system">Star System</option>
            <option value="world">World / Planet</option>
            <option value="region">Region / City</option>
          </select>
        </div>
        <div class="form-group">
          <label>Count</label>
          <input type="number" id="place-count" value="5" min="1" max="50" />
        </div>
        <div class="form-group">
          <label>Seed (optional)</label>
          <input type="number" id="place-seed" value="" placeholder="Leave empty for random" />
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="btn-gen-places">Generate Places</button>
          <button class="btn btn-secondary" id="btn-clear-places">Clear</button>
        </div>
      </div>
      <div id="place-results" class="result-list"></div>
    `;

    panel.querySelector('#btn-gen-places')!.addEventListener('click', () => this.generatePlaces());
    panel.querySelector('#btn-clear-places')!.addEventListener('click', () => {
      panel.querySelector<HTMLDivElement>('#place-results')!.innerHTML = '';
    });
  }

  private generatePlaces() {
    const lc1 = this.root.querySelector<HTMLSelectElement>('#place-lc1')!.value;
    const lc2 = this.root.querySelector<HTMLSelectElement>('#place-lc2')!.value;
    const type = this.root.querySelector<HTMLSelectElement>('#place-type')!.value as 'star_system' | 'world' | 'region';
    const count = parseInt(this.root.querySelector<HTMLInputElement>('#place-count')!.value, 10) || 5;
    const seedVal = this.root.querySelector<HTMLInputElement>('#place-seed')!.value;
    const seed = seedVal ? parseInt(seedVal, 10) : Date.now();

    const weights: LcWeights = { [lc1]: 3, [lc2]: 1 };
    const gen = new PlaceGen({ weights, seed });
    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      let place;
      if (type === 'star_system') place = gen.generateStarSystemName();
      else if (type === 'world') place = gen.generateWorldName();
      else place = gen.generateRegionName();

      const comps = place.components?.map((c: { word: string; category: string }) => `${c.word} (${c.category})`).join(' · ');
      results.push(`
        <div class="result-item">
          <div>
            <div class="result-name">${place.name}</div>
            <div class="result-meta">${comps || place.ipa}</div>
          </div>
          <div class="result-detail">
            Base: ${place.base_lc} · Drift: ${place.drift_lc} · Lvl ${place.drift_level}
          </div>
        </div>
      `);
    }

    this.root.querySelector<HTMLDivElement>('#place-results')!.innerHTML = results.join('');
  }

  /* ===========================
     FACTIONS PANEL
     =========================== */
  private renderFactionsPanel() {
    const panel = this.root.querySelector<HTMLDivElement>('#panel-factions')!;
    panel.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="icon">⚔️</span> Faction Generator</div>
        <div class="grid-2">
          <div class="form-group">
            <label>Population</label>
            <input type="number" id="fac-pop" value="600000000" />
          </div>
          <div class="form-group">
            <label>MTL (Tech)</label>
            <input type="number" id="fac-mtl" value="10" min="0" max="15" />
          </div>
        </div>
        <div class="form-group">
          <label>Wealth</label>
          <select id="fac-wealth">
            <option>Average</option>
            <option>Better-off</option>
            <option selected>Prosperous</option>
            <option>Affluent</option>
          </select>
        </div>
        <div class="form-group">
          <label>Development</label>
          <select id="fac-dev">
            <option>UnderDeveloped</option>
            <option selected>Developed</option>
            <option>Very Developed</option>
          </select>
        </div>
        <div class="form-group">
          <label>Power Structure</label>
          <select id="fac-power">
            <option>Unitary State</option>
            <option selected>Federation</option>
            <option>Confederation</option>
            <option>Anarchy</option>
          </select>
        </div>
        <div class="form-group">
          <label>Source of Power</label>
          <select id="fac-source">
            <option>Aristocracy</option>
            <option>Ideocracy</option>
            <option>Kratocracy</option>
            <option selected>Democracy</option>
            <option>Meritocracy</option>
          </select>
        </div>
        <div class="form-group">
          <label>Culture Rolls (comma-separated)</label>
          <input type="text" id="fac-culture" value="Collectivism, Tradition, Hierarchy" />
        </div>
        <div class="form-group">
          <label>Primary Culture</label>
          <select id="fac-lc1">${LC_OPTIONS.map((lc) => `<option value="${lc.id}">${lc.label}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label>Secondary Culture</label>
          <select id="fac-lc2">${LC_OPTIONS.map((lc, i) => `<option value="${lc.id}" ${i === 4 ? 'selected' : ''}>${lc.label}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label>Seed (optional)</label>
          <input type="number" id="fac-seed" value="" placeholder="Leave empty for random" />
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="btn-gen-factions">Generate Factions</button>
          <button class="btn btn-secondary" id="btn-clear-factions">Clear</button>
        </div>
      </div>
      <div id="faction-results" class="result-list"></div>
    `;

    panel.querySelector('#btn-gen-factions')!.addEventListener('click', () => this.generateFactions());
    panel.querySelector('#btn-clear-factions')!.addEventListener('click', () => {
      panel.querySelector<HTMLDivElement>('#faction-results')!.innerHTML = '';
    });
  }

  private generateFactions() {
    const pop = parseInt(this.root.querySelector<HTMLInputElement>('#fac-pop')!.value, 10) || 600_000_000;
    const mtl = parseInt(this.root.querySelector<HTMLInputElement>('#fac-mtl')!.value, 10) || 10;
    const wealth = this.root.querySelector<HTMLSelectElement>('#fac-wealth')!.value as any;
    const development = this.root.querySelector<HTMLSelectElement>('#fac-dev')!.value as any;
    const powerStructure = this.root.querySelector<HTMLSelectElement>('#fac-power')!.value as any;
    const sourceOfPower = this.root.querySelector<HTMLSelectElement>('#fac-source')!.value as any;
    const cultureRolls = this.root.querySelector<HTMLInputElement>('#fac-culture')!.value.split(',').map((s) => s.trim()).filter(Boolean);
    const lc1 = this.root.querySelector<HTMLSelectElement>('#fac-lc1')!.value;
    const lc2 = this.root.querySelector<HTMLSelectElement>('#fac-lc2')!.value;
    const seedVal = this.root.querySelector<HTMLInputElement>('#fac-seed')!.value;
    const seed = seedVal ? parseInt(seedVal, 10) : Date.now();

    const lcWeights: LcWeights = { [lc1]: 4, [lc2]: 2 };

    const gen = new FactionGen({
      world: {
        population: pop,
        wealth,
        development,
        powerStructure,
        sourceOfPower,
        mtl,
        cultureRolls,
        lcWeights,
      },
      seed,
    });

    const factions = gen.generate();
    const results = factions.map((f) => {
      const rels = f.relationships.length
        ? ` · ${f.relationships.length} relations`
        : '';
      return `
        <div class="result-item faction-card">
          <div>
            <div class="result-name">${f.name}</div>
            <div class="result-meta">${f.type.replace(/_/g, ' ')}${rels}</div>
            <div class="result-detail">Public: ${f.publicGoal}</div>
            <div class="result-detail">Hook: ${f.hook}</div>
          </div>
          <div class="faction-stats">
            <span class="stat-badge">END ${f.attributes.END}</span>
            <span class="stat-badge">SOC ${f.attributes.SOC}</span>
            <span class="stat-badge">INT ${f.attributes.INT}</span>
            <span class="stat-badge">STR ${f.attributes.STR}</span>
            <span class="stat-badge">DEX ${f.attributes.DEX}</span>
            <span class="stat-badge">EDU ${f.attributes.EDU}</span>
          </div>
        </div>
      `;
    });

    this.root.querySelector<HTMLDivElement>('#faction-results')!.innerHTML = results.join('');
  }
}
