/**
 * FactionGen internal types
 */

export interface WorldInputs {
  population: number;
  wealth: 'Average' | 'Better-off' | 'Prosperous' | 'Affluent';
  development: 'UnderDeveloped' | 'Developed' | 'Very Developed';
  powerStructure: 'Anarchy' | 'Confederation' | 'Federation' | 'Unitary State';
  sourceOfPower: 'Aristocracy' | 'Ideocracy' | 'Kratocracy' | 'Democracy' | 'Meritocracy';
  mtl: number;
  cultureRolls: string[];
  lcWeights?: Record<string, number>;
}

export interface EntityAttributes {
  STR: number;
  DEX: number;
  END: number;
  INT: number;
  EDU: number;
  SOC: number;
}

export interface EntityRelationship {
  entityId: string;
  entityName: string;
  type: 'ally' | 'client' | 'competitor' | 'indifferent' | 'rival' | 'enemy';
  nuanceFlags?: string[];
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  population: number;
  attributes: EntityAttributes;
  axisPositions: Record<string, number>;
  relationships: EntityRelationship[];
  keyTerms: string[];
  governance: string;
  sourceOfPower: string;
  publicGoal: string;
  hiddenGoal: string;
  hook: string;
  secret: string;
}

export interface FactionGenOptions {
  world: WorldInputs;
  seed?: number;
  nuance?: 'low' | 'medium' | 'high';
}
