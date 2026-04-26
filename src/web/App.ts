import { NameGen } from '@gi7b/namegen';
import { PlaceGen } from '@gi7b/placegen';
import { FactionGen } from '@gi7b/factiongen';
import type { Gender, LcWeights } from '@gi7b/shared';
import JSZip from 'jszip';
import { rawNameLcData, rawPlaceLcData, rawDriftData, rawLcIndex, rawLcDistance, rawPlaceDescriptors, rawCulturalValues } from './data-loader.js';
import { APP_VERSION } from './version.js';

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

interface SavedSession {
  id: string;
  name: string;
  type: 'names' | 'places' | 'factions';
  createdAt: number;
  data: unknown;
}

export class App {
  private root: HTMLElement;
  private currentTab = 'names';
  private lastResults: { names?: unknown[]; places?: unknown[]; factions?: unknown[] } = {};
  private activeCulturalValues: Array<{ label: string; bias: Record<string, number> }> = [];

  constructor(root: HTMLElement) {
    this.root = root;
  }

  mount() {
    const isDay = localStorage.getItem('theme') === 'day';
    if (isDay) document.body.classList.add('day');

    this.root.innerHTML = `
      <header class="app-header">
        <div class="header-brand">
          <h1>🌍 GI7B World Builder</h1>
          <span class="subtitle">Procedural worlds in your pocket</span>
          <span class="version-badge">v${APP_VERSION}</span>
        </div>
        <div class="header-actions">
          <button class="icon-btn" id="btn-device" title="Toggle desktop/mobile view">📱</button>
          <button class="icon-btn" id="btn-theme" title="Toggle day/night">${isDay ? '🌙' : '☀️'}</button>
        </div>
      </header>
      <nav class="nav-tabs">
        <button class="nav-tab active" data-tab="names">👤 Names</button>
        <button class="nav-tab" data-tab="places">🗺️ Places</button>
        <button class="nav-tab" data-tab="factions">⚔️ Factions</button>
        <button class="nav-tab" data-tab="databases">📚 DBs</button>
      </nav>
      <main class="main-content">
        <div class="panel active" id="panel-names"></div>
        <div class="panel" id="panel-places"></div>
        <div class="panel" id="panel-factions"></div>
        <div class="panel" id="panel-databases"></div>
      </main>
      <div class="toast" id="toast"></div>
    `;

    this.bindTabs();
    this.bindTheme();
    this.bindDevice();
    this.renderNamesPanel();
    this.renderPlacesPanel();
    this.renderFactionsPanel();
    this.renderDatabasesPanel();
  }

  private toast(msg: string, duration = 2000) {
    const el = this.root.querySelector<HTMLDivElement>('#toast')!;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
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

  private bindTheme() {
    const btn = this.root.querySelector<HTMLButtonElement>('#btn-theme')!;
    btn.addEventListener('click', () => {
      const isDay = document.body.classList.toggle('day');
      localStorage.setItem('theme', isDay ? 'day' : 'night');
      btn.textContent = isDay ? '🌙' : '☀️';
    });
  }

  private bindDevice() {
    const btn = this.root.querySelector<HTMLButtonElement>('#btn-device')!;
    const isMobile = localStorage.getItem('deviceView') === 'mobile';
    if (isMobile) {
      document.body.classList.add('mobile-view');
      btn.textContent = '🖥️';
    }
    btn.addEventListener('click', () => {
      const isMobileNow = document.body.classList.toggle('mobile-view');
      localStorage.setItem('deviceView', isMobileNow ? 'mobile' : 'desktop');
      btn.textContent = isMobileNow ? '🖥️' : '📱';
      this.toast(isMobileNow ? 'Mobile view' : 'Desktop view');
    });
  }

  private randomLc(): string {
    return LC_OPTIONS[Math.floor(Math.random() * LC_OPTIONS.length)].id;
  }

  private rollCulturalValues(count = 3): Array<{ label: string; bias: Record<string, number> }> {
    const data = rawCulturalValues as any;
    if (!data?.axes) return [];
    const axes = data.axes as Array<{ axis_name: string; positions: Array<{ label: string; descriptor_bias: Record<string, number> }> }>;
    const rolled: Array<{ label: string; bias: Record<string, number> }> = [];
    const used = new Set<string>();
    for (let i = 0; i < count; i++) {
      const axis = axes[Math.floor(Math.random() * axes.length)];
      const pos = axis.positions[Math.floor(Math.random() * axis.positions.length)];
      const key = `${axis.axis_name}-${pos.label}`;
      if (!used.has(key)) {
        used.add(key);
        rolled.push({ label: `${axis.axis_name}: ${pos.label}`, bias: pos.descriptor_bias || {} });
      }
    }
    return rolled;
  }

  private getCulturalValueBias(): string[] {
    const bias: string[] = [];
    for (const val of this.activeCulturalValues) {
      for (const [cat, weight] of Object.entries(val.bias)) {
        const copies = Math.round(weight);
        for (let i = 0; i < copies; i++) bias.push(cat);
      }
    }
    return bias;
  }

  private renderCulturalValuesPanel(panelId: string): string {
    return `
      <details class="descriptor-details">
        <summary>🎭 Cultural Values (D66)</summary>
        <div class="details-inner">
          <div class="form-group">
            <button class="btn btn-secondary" id="${panelId}-roll-cv" type="button">🎲 Roll Cultural Values</button>
          </div>
          <div id="${panelId}-cv-list" class="cv-list"></div>
        </div>
      </details>
    `;
  }

  private bindCulturalValues(panelId: string) {
    const btn = this.root.querySelector<HTMLButtonElement>(`#${panelId}-roll-cv`);
    const list = this.root.querySelector<HTMLDivElement>(`#${panelId}-cv-list`);
    if (!btn || !list) return;
    btn.addEventListener('click', () => {
      this.activeCulturalValues = this.rollCulturalValues(3);
      list.innerHTML = this.activeCulturalValues.length
        ? this.activeCulturalValues.map((v) => `<div class="cv-chip">${v.label}</div>`).join('')
        : '<div class="cv-chip">No cultural values data</div>';
    });
  }

  private cultureSelect(id: string, value?: string): string {
    return `<select id="${id}">${LC_OPTIONS.map((lc) => `<option value="${lc.id}" ${lc.id === value ? 'selected' : ''}>${lc.label}</option>`).join('')}</select>`;
  }

  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => this.toast('Copied to clipboard'), () => this.toast('Copy failed'));
  }

  private downloadJson(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private exportResults(type: 'names' | 'places' | 'factions') {
    const data = this.lastResults[type];
    if (!data || !data.length) {
      this.toast('Nothing to export');
      return;
    }
    const timestamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
    this.downloadJson(`gi7b-${type}-${timestamp}.json`, data);
    this.toast('Exported to JSON');
  }

  private importResults(type: 'names' | 'places' | 'factions', callback: (data: unknown[]) => void) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (Array.isArray(data)) {
            callback(data);
            this.toast('Imported successfully');
          } else {
            this.toast('Invalid file format');
          }
        } catch {
          this.toast('Failed to parse JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  private saveResults(type: 'names' | 'places' | 'factions', renderFn: (data: unknown[]) => void) {
    const data = this.lastResults[type];
    if (!data || !data.length) {
      this.toast('Nothing to save');
      return;
    }
    const key = `gi7b-save-${type}`;
    const saved: SavedSession = {
      id: key,
      name: `Auto-save ${type}`,
      type,
      createdAt: Date.now(),
      data,
    };
    localStorage.setItem(key, JSON.stringify(saved));
    this.toast('Saved to browser storage');
  }

  private saveAsResults(type: 'names' | 'places' | 'factions') {
    const data = this.lastResults[type];
    if (!data || !data.length) {
      this.toast('Nothing to save');
      return;
    }
    const name = prompt('Save as:', `gi7b-${type}-${Date.now()}`);
    if (!name) return;
    const key = `gi7b-save-${Date.now()}`;
    const saved: SavedSession = { id: key, name, type, createdAt: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(saved));
    this.toast(`Saved as "${name}"`);
  }

  private renderDataActions(type: 'names' | 'places' | 'factions', renderFn: (data: unknown[]) => void) {
    return `
      <div class="data-actions">
        <button class="btn btn-secondary" data-action="export-${type}">📤 Export</button>
        <button class="btn btn-secondary" data-action="import-${type}">📥 Import</button>
        <button class="btn btn-secondary" data-action="save-${type}">💾 Save</button>
        <button class="btn btn-secondary" data-action="saveas-${type}">💾 Save As</button>
      </div>
    `;
  }

  private bindDataActions(panel: HTMLElement, type: 'names' | 'places' | 'factions', renderFn: (data: unknown[]) => void) {
    panel.querySelector(`[data-action="export-${type}"]`)?.addEventListener('click', () => this.exportResults(type));
    panel.querySelector(`[data-action="import-${type}"]`)?.addEventListener('click', () => this.importResults(type, (data) => {
      this.lastResults[type] = data;
      renderFn(data);
    }));
    panel.querySelector(`[data-action="save-${type}"]`)?.addEventListener('click', () => this.saveResults(type, renderFn));
    panel.querySelector(`[data-action="saveas-${type}"]`)?.addEventListener('click', () => this.saveAsResults(type));
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
          <div class="culture-row">
            ${this.cultureSelect('name-lc1', 'en-gb')}
            <button class="icon-btn" id="name-rand-lc1" title="Randomize">🎲</button>
          </div>
        </div>
        <div class="form-group">
          <label>Secondary Culture (Drift)</label>
          <div class="culture-row">
            ${this.cultureSelect('name-lc2', 'ja-jp')}
            <button class="icon-btn" id="name-rand-lc2" title="Randomize">🎲</button>
          </div>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="name-independent" /> 🔀 Generate Independently</label>
        </div>
        <div class="form-group">
          <label>Gender</label>
          <select id="name-gender">
            <option value="">Random</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="N">Non-binary</option>
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
        ${this.renderCulturalValuesPanel('name')}
        <details class="descriptor-details">
          <summary>🏷️ Descriptors, Titles & Nicknames</summary>
          <div class="details-inner">
            <div class="grid-2">
              <div class="form-group">
                <label>Descriptor Odds (1=rare, 3=always)</label>
                <select id="name-desc-odds">
                  <option value="0">None</option>
                  <option value="1" selected>1 — Rare (33%)</option>
                  <option value="2">2 — Common (66%)</option>
                  <option value="3">3 — Always (100%)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Max Descriptors</label>
                <select id="name-desc-max">
                  <option value="1">1</option>
                  <option value="2" selected>2</option>
                </select>
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Title Odds</label>
                <select id="name-title-odds">
                  <option value="0">None</option>
                  <option value="1" selected>1 — Rare (33%)</option>
                  <option value="2">2 — Common (66%)</option>
                  <option value="3">3 — Always (100%)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nickname Odds</label>
                <select id="name-nick-odds">
                  <option value="0">None</option>
                  <option value="1" selected>1 — Rare (33%)</option>
                  <option value="2">2 — Common (66%)</option>
                  <option value="3">3 — Always (100%)</option>
                </select>
              </div>
            </div>
          </div>
        </details>
        <div class="btn-row">
          <button class="btn btn-primary" id="btn-gen-names">Generate Names</button>
          <button class="btn btn-secondary" id="btn-clear-names">Clear</button>
        </div>
      </div>
      ${this.renderDataActions('names', (data) => this.renderNameResults(data as any[]))}
      <div id="name-results" class="result-list multi-col"></div>
    `;

    panel.querySelector('#name-rand-lc1')!.addEventListener('click', () => {
      (panel.querySelector('#name-lc1') as HTMLSelectElement).value = this.randomLc();
    });
    panel.querySelector('#name-rand-lc2')!.addEventListener('click', () => {
      (panel.querySelector('#name-lc2') as HTMLSelectElement).value = this.randomLc();
    });
    panel.querySelector('#btn-gen-names')!.addEventListener('click', () => this.generateNames());
    panel.querySelector('#btn-clear-names')!.addEventListener('click', () => {
      panel.querySelector<HTMLDivElement>('#name-results')!.innerHTML = '';
      this.lastResults.names = [];
    });
    this.bindCulturalValues('name');
    this.bindDataActions(panel, 'names', (data) => this.renderNameResults(data as any[]));
  }

  private generateNames() {
    const lc1 = this.root.querySelector<HTMLSelectElement>('#name-lc1')!.value;
    const lc2 = this.root.querySelector<HTMLSelectElement>('#name-lc2')!.value;
    const gender = this.root.querySelector<HTMLSelectElement>('#name-gender')!.value as Gender | '';
    const count = parseInt(this.root.querySelector<HTMLInputElement>('#name-count')!.value, 10) || 5;
    const seedVal = this.root.querySelector<HTMLInputElement>('#name-seed')!.value;
    const seed = seedVal ? parseInt(seedVal, 10) : Date.now();

    const descOdds = parseInt(this.root.querySelector<HTMLSelectElement>('#name-desc-odds')!.value, 10) as 0 | 1 | 2 | 3;
    const descMax = parseInt(this.root.querySelector<HTMLSelectElement>('#name-desc-max')!.value, 10) as 1 | 2;
    const titleOdds = parseInt(this.root.querySelector<HTMLSelectElement>('#name-title-odds')!.value, 10) as 0 | 1 | 2 | 3;
    const nickOdds = parseInt(this.root.querySelector<HTMLSelectElement>('#name-nick-odds')!.value, 10) as 0 | 1 | 2 | 3;

    const independent = this.root.querySelector<HTMLInputElement>('#name-independent')!.checked;
    const cvBias = this.getCulturalValueBias();
    const weights: LcWeights = { [lc1]: 3, [lc2]: 1 };
    const gen = new NameGen({
      weights,
      seed,
      forceBaseLc: independent ? undefined : lc1,
      forceDriftLc: independent ? undefined : lc2,
      descriptors: {
        descriptorOdds: descOdds || undefined,
        maxDescriptors: descMax,
        includeTitles: titleOdds > 0,
        includeNicknames: nickOdds > 0,
        titleOdds: titleOdds || undefined,
        nicknameOdds: nickOdds || undefined,
        valueBias: cvBias.length > 0 ? cvBias : undefined,
      },
    });
    const results = [];

    for (let i = 0; i < count; i++) {
      results.push(gen.generateName({ gender: gender || undefined }));
    }

    this.lastResults.names = results;
    this.renderNameResults(results);
  }

  private renderNameResults(results: any[]) {
    const html = results.map((name, idx) => {
      const dr = name.descriptorResult;
      const hasDecorations = dr.descriptors.length > 0 || dr.title || dr.nickname;
      const decorations = [];
      if (dr.title) decorations.push(`Title: ${dr.title}`);
      if (dr.nickname) decorations.push(`Nick: "${dr.nickname}"`);
      if (dr.descriptors.length) decorations.push(`Epithets: ${dr.descriptors.join(', ')}`);

      const g = name.given;
      const f = name.family;
      const hasShorten = (g.shorten_level > 0 || f.shorten_level > 0);
      const shortenBadge = hasShorten
        ? `<span class="stat-badge" title="Pronunciation drift: ${g.shorten_level === 2 || f.shorten_level === 2 ? 'Significant' : 'Some'}">✂️ ${g.shorten_level === 2 || f.shorten_level === 2 ? 'Significant' : 'Some'}</span>`
        : '';
      const ipaLine = g.shortened_ipa || f.shortened_ipa
        ? `<div class="result-detail">IPA: ${g.ipa} → ${g.shortened_ipa || g.ipa} · ${f.ipa} → ${f.shortened_ipa || f.ipa}</div>`
        : `<div class="result-detail">IPA: ${g.ipa} · ${f.ipa}</div>`;

      return `
      <div class="result-item">
        <div>
          <div class="result-name">${name.displayName || name.fullName}</div>
          ${hasDecorations ? `<div class="result-meta">${decorations.join(' · ')}</div>` : ''}
          <div class="result-detail">Given: ${g.name} · Family: ${f.name}</div>
          ${ipaLine}
          <div class="result-detail">Base: ${g.base_lc} · Drift: ${g.drift_lc} · Lvl ${g.drift_level} ${shortenBadge}</div>
        </div>
        <div class="result-actions">
          <button class="icon-btn" data-copy="${idx}" title="Copy decorated name">📋</button>
        </div>
      </div>
    `}).join('');

    const container = this.root.querySelector<HTMLDivElement>('#name-results')!;
    container.innerHTML = html;
    container.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-copy')!, 10);
        this.copyToClipboard(results[idx].displayName || results[idx].fullName);
      });
    });
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
          <div class="culture-row">
            ${this.cultureSelect('place-lc1', 'en-gb')}
            <button class="icon-btn" id="place-rand-lc1" title="Randomize">🎲</button>
          </div>
        </div>
        <div class="form-group">
          <label>Secondary Culture (Drift)</label>
          <div class="culture-row">
            ${this.cultureSelect('place-lc2', 'fr-fr')}
            <button class="icon-btn" id="place-rand-lc2" title="Randomize">🎲</button>
          </div>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="place-independent" /> 🔀 Generate Independently</label>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="place-type">
            <option value="star_system">Star System</option>
            <option value="world">World / Planet</option>
            <option value="region">Region / City</option>
          </select>
        </div>
        ${this.renderCulturalValuesPanel('place')}
        <details class="descriptor-details">
          <summary>🏷️ Place Descriptors</summary>
          <div class="details-inner">
            <div class="form-group">
              <label>Descriptor Odds (1=rare, 3=always)</label>
              <select id="place-desc-odds">
                <option value="0">None</option>
                <option value="1" selected>1 — Rare (33%)</option>
                <option value="2">2 — Common (66%)</option>
                <option value="3">3 — Always (100%)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Value Bias (comma-separated categories)</label>
              <input type="text" id="place-desc-bias" placeholder="e.g. tradition, nature, commerce" />
            </div>
          </div>
        </details>
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
      ${this.renderDataActions('places', (data) => this.renderPlaceResults(data as any[]))}
      <div id="place-results" class="result-list multi-col"></div>
    `;

    panel.querySelector('#place-rand-lc1')!.addEventListener('click', () => {
      (panel.querySelector('#place-lc1') as HTMLSelectElement).value = this.randomLc();
    });
    panel.querySelector('#place-rand-lc2')!.addEventListener('click', () => {
      (panel.querySelector('#place-lc2') as HTMLSelectElement).value = this.randomLc();
    });
    panel.querySelector('#btn-gen-places')!.addEventListener('click', () => this.generatePlaces());
    panel.querySelector('#btn-clear-places')!.addEventListener('click', () => {
      panel.querySelector<HTMLDivElement>('#place-results')!.innerHTML = '';
      this.lastResults.places = [];
    });
    this.bindCulturalValues('place');
    this.bindDataActions(panel, 'places', (data) => this.renderPlaceResults(data as any[]));
  }

  private generatePlaces() {
    const lc1 = this.root.querySelector<HTMLSelectElement>('#place-lc1')!.value;
    const lc2 = this.root.querySelector<HTMLSelectElement>('#place-lc2')!.value;
    const type = this.root.querySelector<HTMLSelectElement>('#place-type')!.value as 'star_system' | 'world' | 'region';
    const count = parseInt(this.root.querySelector<HTMLInputElement>('#place-count')!.value, 10) || 5;
    const seedVal = this.root.querySelector<HTMLInputElement>('#place-seed')!.value;
    const seed = seedVal ? parseInt(seedVal, 10) : Date.now();

    const independent = this.root.querySelector<HTMLInputElement>('#place-independent')!.checked;
    const descOdds = parseInt(this.root.querySelector<HTMLSelectElement>('#place-desc-odds')!.value, 10) as 0 | 1 | 2 | 3;
    const descBias = this.root.querySelector<HTMLInputElement>('#place-desc-bias')!.value.split(',').map((s) => s.trim()).filter(Boolean);
    const cvBias = this.getCulturalValueBias();
    const mergedBias = [...descBias, ...cvBias];

    const weights: LcWeights = { [lc1]: 3, [lc2]: 1 };
    const gen = new PlaceGen({
      weights,
      seed,
      forceBaseLc: independent ? undefined : lc1,
      forceDriftLc: independent ? undefined : lc2,
      descriptors: descOdds > 0 ? {
        valueBias: mergedBias.length > 0 ? mergedBias : undefined,
      } : undefined,
    });
    const results = [];

    for (let i = 0; i < count; i++) {
      if (type === 'star_system') results.push(gen.generateStarSystemName());
      else if (type === 'world') results.push(gen.generateWorldName());
      else results.push(gen.generateRegionName());
    }

    this.lastResults.places = results;
    this.renderPlaceResults(results);
  }

  private renderPlaceResults(results: any[]) {
    const html = results.map((place, idx) => {
      const comps = place.components?.map((c: { word: string; category: string }) => `${c.word} (${c.category})`).join(' · ');
      const hasDescriptors = place.descriptors && place.descriptors.length > 0;
      return `
        <div class="result-item">
          <div>
            <div class="result-name">${place.displayName || place.name}</div>
            ${hasDescriptors ? `<div class="result-meta">Descriptors: ${place.descriptors.join(', ')}</div>` : ''}
            <div class="result-meta">${comps || place.ipa}</div>
            <div class="result-detail">Base: ${place.base_lc} · Drift: ${place.drift_lc} · Lvl ${place.drift_level}</div>
          </div>
          <div class="result-actions">
            <button class="icon-btn" data-copy="${idx}" title="Copy name">📋</button>
          </div>
        </div>
      `;
    }).join('');

    const container = this.root.querySelector<HTMLDivElement>('#place-results')!;
    container.innerHTML = html;
    container.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-copy')!, 10);
        this.copyToClipboard(results[idx].name);
      });
    });
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
          <div class="culture-row">
            ${this.cultureSelect('fac-lc1', 'en-gb')}
            <button class="icon-btn" id="fac-rand-lc1" title="Randomize">🎲</button>
          </div>
        </div>
        <div class="form-group">
          <label>Secondary Culture</label>
          <div class="culture-row">
            ${this.cultureSelect('fac-lc2', 'fr-fr')}
            <button class="icon-btn" id="fac-rand-lc2" title="Randomize">🎲</button>
          </div>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="fac-independent" /> 🔀 Generate Independently</label>
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
      ${this.renderDataActions('factions', (data) => this.renderFactionResults(data as any[]))}
      <div id="faction-results" class="result-list multi-col"></div>
    `;

    panel.querySelector('#fac-rand-lc1')!.addEventListener('click', () => {
      (panel.querySelector('#fac-lc1') as HTMLSelectElement).value = this.randomLc();
    });
    panel.querySelector('#fac-rand-lc2')!.addEventListener('click', () => {
      (panel.querySelector('#fac-lc2') as HTMLSelectElement).value = this.randomLc();
    });
    panel.querySelector('#btn-gen-factions')!.addEventListener('click', () => this.generateFactions());
    panel.querySelector('#btn-clear-factions')!.addEventListener('click', () => {
      panel.querySelector<HTMLDivElement>('#faction-results')!.innerHTML = '';
      this.lastResults.factions = [];
    });
    this.bindDataActions(panel, 'factions', (data) => this.renderFactionResults(data as any[]));
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

    const independent = this.root.querySelector<HTMLInputElement>('#fac-independent')!.checked;
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
      forceBaseLc: independent ? undefined : lc1,
      forceDriftLc: independent ? undefined : lc2,
    });

    const factions = gen.generate();
    this.lastResults.factions = factions;
    this.renderFactionResults(factions);
  }

  private renderFactionResults(factions: any[]) {
    const html = factions.map((f, idx) => {
      const rels = f.relationships.length ? ` · ${f.relationships.length} relations` : '';
      return `
        <div class="result-item faction-card">
          <div class="result-header">
            <div>
              <div class="result-name">${f.name}</div>
              <div class="result-meta">${f.type.replace(/_/g, ' ')}${rels}</div>
              <div class="result-detail">Public: ${f.publicGoal}</div>
              <div class="result-detail">Hook: ${f.hook}</div>
            </div>
            <div class="result-actions">
              <button class="icon-btn" data-copy="${idx}" title="Copy name">📋</button>
            </div>
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
    }).join('');

    const container = this.root.querySelector<HTMLDivElement>('#faction-results')!;
    container.innerHTML = html;
    container.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-copy')!, 10);
        this.copyToClipboard(factions[idx].name);
      });
    });
  }

  /* ===========================
     DATABASES PANEL
     =========================== */
  private renderDatabasesPanel() {
    const panel = this.root.querySelector<HTMLDivElement>('#panel-databases')!;
    
    const nameLcs = Object.keys(rawNameLcData).sort();
    const placeLcs = Object.keys(rawPlaceLcData).sort();
    const drifts = Object.keys(rawDriftData).sort();
    const hasPlaceDescriptors = rawPlaceDescriptors !== null;
    
    const lcTable = (lcs: string[], data: Record<string, unknown>, showDescriptors = false) => lcs.map(id => {
      const d = data[id] as any;
      const words = d?.words?.length || d?.wordBank?.length || 0;
      const rules = d?.syllableRules?.length || d?.morphemes?.length || 0;
      const descs = d?.descriptors?.length ?? 0;
      const descNouns = d?.descriptor_nouns?.length ?? 0;
      const titles = d?.titles?.length ?? 0;
      const nicks = d?.nicknames?.length ?? 0;
      const extraCols = showDescriptors
        ? `<td>${descs}</td><td>${descNouns}</td><td>${titles}</td><td>${nicks}</td>`
        : `<td>${words}</td><td>${rules}</td>`;
      return `<tr><td><code>${id}</code></td>${extraCols}<td><button class="btn btn-small" data-dl-lc="${id}">⬇️ JSON</button></td></tr>`;
    }).join('');
    
    panel.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="icon">📚</span> Database Download</div>
        <p class="help-text">Download all linguistic culture (LC) profiles and drift rule databases as individual JSON files or a bundled ZIP.</p>
        <div class="btn-row">
          <button class="btn btn-primary" id="btn-dl-all">⬇️ Download All (ZIP)</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title"><span class="icon">👤</span> NameGen LC Profiles (${nameLcs.length})</div>
        <table class="db-table">
          <thead><tr><th>LC</th><th>Desc</th><th>Noun-D</th><th>Titles</th><th>Nicks</th><th></th></tr></thead>
          <tbody>${lcTable(nameLcs, rawNameLcData, true)}</tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-title"><span class="icon">🗺️</span> PlaceGen LC Profiles (${placeLcs.length})</div>
        <table class="db-table">
          <thead><tr><th>LC</th><th>Words</th><th>Rules</th><th></th></tr></thead>
          <tbody>${lcTable(placeLcs, rawPlaceLcData)}</tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-title"><span class="icon">🔀</span> Drift Rules (${drifts.length})</div>
        <table class="db-table">
          <thead><tr><th>Drift</th><th>Rules</th><th></th></tr></thead>
          <tbody>${drifts.map(id => {
            const d = rawDriftData[id] as any;
            const rules = d?.substitutions?.length || 0;
            return `<tr><td><code>${id}</code></td><td>${rules}</td><td><button class="btn btn-small" data-dl-drift="${id}">⬇️ JSON</button></td></tr>`;
          }).join('')}</tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-title"><span class="icon">🏷️</span> Place Descriptors</div>
        <table class="db-table">
          <thead><tr><th>File</th><th>Entries</th><th></th></tr></thead>
          <tbody>
            <tr>
              <td><code>place-descriptors.json</code></td>
              <td>${hasPlaceDescriptors ? (rawPlaceDescriptors as any).descriptors?.length ?? 0 : 0}</td>
              <td><button class="btn btn-small" data-dl-pd="1">⬇️ JSON</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-title"><span class="icon">📊</span> Shared Data</div>
        <table class="db-table">
          <thead><tr><th>File</th><th></th></tr></thead>
          <tbody>
            <tr><td><code>lc-index.json</code></td><td><button class="btn btn-small" data-dl-shared="index">⬇️ JSON</button></td></tr>
            <tr><td><code>lc-distance.json</code></td><td><button class="btn btn-small" data-dl-shared="distance">⬇️ JSON</button></td></tr>
          </tbody>
        </table>
      </div>
    `;
    
    panel.querySelector('#btn-dl-all')!.addEventListener('click', () => this.downloadAllZip());
    
    panel.querySelectorAll('[data-dl-lc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-dl-lc')!;
        this.downloadJson(`${id}.json`, rawNameLcData[id]);
      });
    });
    
    panel.querySelectorAll('[data-dl-drift]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-dl-drift')!;
        this.downloadJson(`drift-${id}.json`, rawDriftData[id]);
      });
    });
    
    panel.querySelector('[data-dl-pd="1"]')!.addEventListener('click', () => {
      this.downloadJson('place-descriptors.json', rawPlaceDescriptors);
    });

    panel.querySelector('[data-dl-shared="index"]')!.addEventListener('click', () => {
      this.downloadJson('lc-index.json', rawLcIndex);
    });

    panel.querySelector('[data-dl-shared="distance"]')!.addEventListener('click', () => {
      this.downloadJson('lc-distance.json', rawLcDistance);
    });
  }

  private async downloadAllZip() {
    const zip = new JSZip();
    const nameLcs = Object.keys(rawNameLcData).sort();
    const placeLcs = Object.keys(rawPlaceLcData).sort();
    const drifts = Object.keys(rawDriftData).sort();
    
    for (const id of nameLcs) {
      zip.file(`namegen/lc/${id}.json`, JSON.stringify(rawNameLcData[id], null, 2));
    }
    for (const id of placeLcs) {
      zip.file(`placegen/lc/${id}.json`, JSON.stringify(rawPlaceLcData[id], null, 2));
    }
    for (const id of drifts) {
      zip.file(`namegen/drift-rules/${id}.json`, JSON.stringify(rawDriftData[id], null, 2));
    }
    zip.file('shared/lc-index.json', JSON.stringify(rawLcIndex, null, 2));
    zip.file('shared/lc-distance.json', JSON.stringify(rawLcDistance, null, 2));
    if (rawPlaceDescriptors) {
      zip.file('placegen/place-descriptors.json', JSON.stringify(rawPlaceDescriptors, null, 2));
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gi7b-generators-databases.zip';
    a.click();
    URL.revokeObjectURL(url);
  }
}
