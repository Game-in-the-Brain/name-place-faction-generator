/**
 * FactionGen — social entity and faction generator
 */

import { Rng } from '@gi7b/shared';
import { NameGen } from '@gi7b/namegen';
import { PlaceGen } from '@gi7b/placegen';
import type {
  WorldInputs,
  Entity,
  EntityAttributes,
  FactionGenOptions,
  EntityRelationship,
} from './types.js';

const ENTITY_TYPES = [
  'corporation',
  'political_party',
  'criminal_syndicate',
  'religious_order',
  'military_command',
  'academic_institution',
  'noble_house',
  'guild',
  'union',
  'independent',
];

const GOAL_TEMPLATES = [
  { public: 'Expand market share', hidden: 'Monopolise supply chain' },
  { public: 'Protect citizen interests', hidden: 'Consolidate personal power' },
  { public: 'Preserve cultural heritage', hidden: 'Suppress dissenting voices' },
  { public: 'Advance scientific research', hidden: 'Weaponise discoveries' },
  { public: 'Maintain public order', hidden: 'Expand surveillance state' },
  { public: 'Promote free trade', hidden: 'Eliminate competition' },
  { public: 'Defend the realm', hidden: 'Stage a coup' },
  { public: 'Alleviate poverty', hidden: 'Recruit desperate masses' },
  { public: 'Explore the frontier', hidden: 'Claim resources before rivals' },
  { public: 'Reform the government', hidden: 'Install puppet leadership' },
];

const SECRET_TEMPLATES = [
  'Embezzling funds',
  'Secret alliance with rival',
  'Blackmailing officials',
  'Illegal experiments',
  'Smuggling operation',
  'Assassination plot',
  'Forged documents',
  'Hidden debt crisis',
  'Infiltrated by foreign agents',
  'Leader is an impostor',
];

const HOOK_TEMPLATES = [
  'A key shipment has gone missing.',
  'A whistleblower needs extraction.',
  'A rival is about to make a major move.',
  'An insider wants to defect.',
  'A disaster has created a power vacuum.',
  'A valuable resource has been discovered.',
  'A scandal threatens to destabilise everything.',
  'A long-lost heir has resurfaced.',
  'A new technology could shift the balance.',
  'A customs inspection is imminent.',
];

export class FactionGen {
  private rng: Rng;
  private world: WorldInputs;
  private nuance: 'low' | 'medium' | 'high';
  private nameGen: NameGen;
  private placeGen: PlaceGen;
  private entityCounter = 0;

  constructor(options: FactionGenOptions) {
    this.rng = new Rng(options.seed ?? Date.now());
    this.world = options.world;
    this.nuance = options.nuance ?? 'medium';
    this.nameGen = new NameGen({ weights: options.world.lcWeights, seed: options.seed });
    this.placeGen = new PlaceGen({ weights: options.world.lcWeights, seed: options.seed });
  }

  generate(): Entity[] {
    const count = this.determineEntityCount();
    const types = this.determineEntityTypes(count);
    const entities: Entity[] = [];

    for (let i = 0; i < count; i++) {
      const entity = this.createEntity(i, types[i]);
      entities.push(entity);
    }

    // Generate relationships
    this.generateRelationships(entities);

    return entities;
  }

  private determineEntityCount(): number {
    const popLog = Math.floor(Math.log10(Math.max(this.world.population, 1)));
    const structureMod: Record<string, number> = {
      'Unitary State': -2,
      'Federation': 0,
      'Confederation': 2,
      'Anarchy': 4,
    };
    const mod = structureMod[this.world.powerStructure] ?? 0;
    let count = popLog + mod;

    // Development boost
    if (this.world.development === 'Developed') count += 1;
    if (this.world.development === 'Very Developed') count += 2;

    // Wealth concentration reduces count
    if (this.world.wealth === 'Affluent' && this.world.development !== 'Very Developed') count -= 1;

    return Math.max(2, Math.min(20, count));
  }

  private determineEntityTypes(count: number): string[] {
    const sourceTypeMap: Record<string, string[]> = {
      'Aristocracy': ['noble_house', 'religious_order', 'guild', 'corporation'],
      'Ideocracy': ['political_party', 'religious_order', 'academic_institution', 'guild'],
      'Kratocracy': ['military_command', 'criminal_syndicate', 'corporation', 'union'],
      'Democracy': ['political_party', 'union', 'corporation', 'academic_institution'],
      'Meritocracy': ['academic_institution', 'guild', 'corporation', 'political_party'],
    };

    const dominantTypes = sourceTypeMap[this.world.sourceOfPower] ?? ENTITY_TYPES;
    const types: string[] = [];

    for (let i = 0; i < count; i++) {
      if (i < 3) {
        types.push(dominantTypes[i % dominantTypes.length]);
      } else {
        types.push(this.rng.pick(ENTITY_TYPES));
      }
    }

    return types;
  }

  private createEntity(index: number, type: string): Entity {
    this.entityCounter++;
    const popShare = this.calculatePopulationShare(index);
    const entityPop = Math.max(1, Math.floor(this.world.population * popShare));

    const attrs = this.generateAttributes(type, entityPop);
    const name = this.generateEntityName(type);
    const goals = this.rng.pick(GOAL_TEMPLATES);

    return {
      id: `entity-${this.entityCounter}`,
      name,
      type,
      population: entityPop,
      attributes: attrs,
      axisPositions: this.generateAxisPositions(),
      relationships: [],
      keyTerms: [type.replace('_', ' '), this.world.powerStructure, this.world.sourceOfPower],
      governance: this.world.powerStructure,
      sourceOfPower: this.world.sourceOfPower,
      publicGoal: goals.public,
      hiddenGoal: goals.hidden,
      hook: this.rng.pick(HOOK_TEMPLATES),
      secret: this.rng.pick(SECRET_TEMPLATES),
    };
  }

  private calculatePopulationShare(index: number): number {
    // Power-law distribution: first entity gets largest share
    const alpha = 1.5;
    const rank = index + 1;
    const share = 1 / Math.pow(rank, alpha);
    // Normalise roughly (sum of series ~ zeta(1.5) ≈ 2.612)
    return share / 2.612;
  }

  private generateAttributes(type: string, entityPop: number): EntityAttributes {
    const mtl = this.world.mtl;
    const dev = this.world.development;

    const end = Math.min(15, Math.max(2, Math.floor(Math.log10(Math.max(entityPop, 1)) * 2)));
    const str = Math.min(15, Math.max(2, Math.floor(end * 0.5 + mtl * 0.3)));
    const dex = Math.min(15, Math.max(2, Math.floor(this.rng.int(3, 8) + (this.world.powerStructure === 'Unitary State' ? 2 : 0))));
    const int = Math.min(15, Math.max(2, Math.floor((dev === 'Very Developed' ? 8 : dev === 'Developed' ? 6 : 4) + this.rng.int(-2, 2))));
    const edu = Math.min(15, Math.max(2, Math.floor(int * 0.8 + mtl * 0.2 + this.rng.int(-1, 2))));
    const socBase = this.world.sourceOfPower === 'Aristocracy' || this.world.sourceOfPower === 'Kratocracy' ? 8 : 5;
    const soc = Math.min(15, Math.max(2, socBase + this.rng.int(-2, 3)));

    return { STR: str, DEX: dex, END: end, INT: int, EDU: edu, SOC: soc };
  }

  private generateEntityName(type: string): string {
    // Use PlaceGen for place-based names, NameGen for person-based names
    const usePlace = ['noble_house', 'corporation', 'guild', 'military_command', 'religious_order'].includes(type);

    if (usePlace) {
      const place = this.placeGen.generateWorldName();
      const suffix = this.entityTypeToSuffix(type);
      return `${place.name} ${suffix}`;
    }

    const name = this.nameGen.generateName();
    const suffix = this.entityTypeToSuffix(type);
    return `${name.fullName.split(' ')[1]} ${suffix}`;
  }

  private entityTypeToSuffix(type: string): string {
    const map: Record<string, string> = {
      corporation: 'Consortium',
      political_party: 'Party',
      criminal_syndicate: 'Syndicate',
      religious_order: 'Order',
      military_command: 'Command',
      academic_institution: 'Institute',
      noble_house: 'House',
      guild: 'Guild',
      union: 'Union',
      independent: 'Collective',
    };
    return map[type] ?? 'Group';
  }

  private generateAxisPositions(): Record<string, number> {
    const axes = ['collectivism', 'tradition', 'hierarchy', 'pacifism', 'spirituality', 'openness'];
    const positions: Record<string, number> = {};
    for (const axis of axes) {
      positions[axis] = this.rng.int(-3, 3);
    }
    return positions;
  }

  private generateRelationships(entities: Entity[]): void {
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const a = entities[i];
        const b = entities[j];
        const rel = this.determineRelationship(a, b);
        if (rel) {
          a.relationships.push({ entityId: b.id, entityName: b.name, ...rel });
          // Mirror relationship
          const mirrorType = this.mirrorType(rel.type);
          b.relationships.push({ entityId: a.id, entityName: a.name, type: mirrorType, nuanceFlags: rel.nuanceFlags });
        }
      }
    }
  }

  private determineRelationship(a: Entity, b: Entity): Omit<EntityRelationship, 'entityId' | 'entityName'> | null {
    // Compute axis agreement
    let agreement = 0;
    const axes = Object.keys(a.axisPositions);
    for (const axis of axes) {
      agreement += 3 - Math.abs(a.axisPositions[axis] - b.axisPositions[axis]);
    }

    let type: EntityRelationship['type'];
    if (agreement >= 14) type = 'ally';
    else if (agreement >= 10) type = 'client';
    else if (agreement >= 6) type = 'competitor';
    else if (agreement >= 3) type = 'rival';
    else type = 'enemy';

    // Type interaction modifiers
    if (a.type === 'military_command' && b.type === 'political_party') {
      type = this.nudgeType(type, -1);
    }
    if (a.type === 'criminal_syndicate' && b.type === 'corporation') {
      type = this.nudgeType(type, -1);
    }

    const flags: string[] = [];
    if (a.publicGoal.includes('Monopolise') && b.type === 'corporation') flags.push('resource_competition');

    return { type, nuanceFlags: flags };
  }

  private nudgeType(type: EntityRelationship['type'], delta: number): EntityRelationship['type'] {
    const order: EntityRelationship['type'][] = ['ally', 'client', 'competitor', 'indifferent', 'rival', 'enemy'];
    const idx = order.indexOf(type);
    const newIdx = Math.max(0, Math.min(order.length - 1, idx + delta));
    return order[newIdx];
  }

  private mirrorType(type: EntityRelationship['type']): EntityRelationship['type'] {
    const map: Record<string, EntityRelationship['type']> = {
      ally: 'ally',
      client: 'ally',
      competitor: 'competitor',
      indifferent: 'indifferent',
      rival: 'rival',
      enemy: 'enemy',
    };
    return map[type] ?? type;
  }
}
